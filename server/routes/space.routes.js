import express from 'express';
import Space from '../models/space.model.js';
import upload from '../middleware/multer.middleware.js';
import { createSpace } from '../controllers/spaceController.js';
import excelUpload from '../middleware/excelUpload.middleware.js';
import Campaign from '../models/campign.model.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import * as XLSX from 'xlsx';
const router = express.Router();

const cpUpload = upload.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'longShot', maxCount: 1 },
  { name: 'closeShot', maxCount: 1 },
  { name: 'otherPhotos', maxCount: 10 },
]);


router.post('/create', cpUpload, createSpace)

function parseDate(dateString) {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(2000 + year, month - 1, day); // year is like 25 => 2025
}
router.get('/active-spaces', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Both from and to dates are required in YYYY-MM-DD format.' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1); // include full day

    const campaigns = await Campaign.find({
      createdAt: {
        $gte: fromDate,
        $lt: toDate
      }
    });

    const bookedSpaceIds = new Set();
    campaigns.forEach(campaign => {
      (campaign.spaces || []).forEach(space => {
        if (space?.id) {
          bookedSpaceIds.add(String(space.id));
        }
      });
    });

    res.json({ bookedSpaceIds: [...bookedSpaceIds] });
  } catch (error) {
    console.error('Error fetching active campaign spaces:', error);
    res.status(500).json({ error: 'Server error while fetching active campaign spaces.' });
  }
});
router.get('/available', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const requestedStart = new Date(start);
    const requestedEnd = new Date(end);

    const allSpaces = await Space.find();

    const availableSpaces = allSpaces.filter(space => {
      if (!space.dates || space.dates.length < 2) return false;

      const [spaceStartStr, spaceEndStr] = space.dates;

      const [day1, month1, year1] = spaceStartStr.split('-').map(Number);
      const [day2, month2, year2] = spaceEndStr.split('-').map(Number);

      const spaceStart = new Date(2000 + year1, month1 - 1, day1);
      const spaceEnd = new Date(2000 + year2, month2 - 1, day2);

      return spaceStart <= requestedStart && spaceEnd >= requestedEnd;
    });

    res.json(availableSpaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available spaces', details: error.message });
  }
});

const ENUMS = {
  spaceType: ['Billboard', 'DOOH', 'Gantry', 'Pole Kiosk'],
  category: ['Retail', 'Transit'],
  mediaType: ['Static', 'Digital'],
  audience: ['Youth', 'Working Professionals'],
  demographics: ['Urban', 'Rural'],
  illuminations: ['Front lit', 'Back lit'],
  availability: ['Completely available', 'Partialy available', 'Completely booked'],
  zone: ['East', 'West', 'North', 'South'],
  ownership: ['Owned', 'Leased', 'Traded'],
  tier: ['Tier 1', 'Tier 2'],
};

// Normalize Excel header names to camelCase schema keys
const MODEL_KEYS = [
  'spaceName', 'landlord', 'peerMediaOwner', 'spaceType', 'traded', 'category',
  'mediaType', 'price', 'footfall', 'audience', 'demographics', 'description',
  'illuminations', 'unit', 'occupiedUnits', 'width', 'height', 'additionalTags',
  'previousBrands', 'tags', 'address', 'city', 'state', 'latitude', 'longitude',
  'landmark', 'zone', 'ownership', 'tier', 'faciaTowards', 'overlappingBooking',
  'availability', 'dates'
];

const normalizedMap = {};
MODEL_KEYS.forEach(key => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  normalizedMap[normalized] = key;
});

// Helper functions
const parseNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? undefined : n;
};

const enumFix = (val, validValues) => {
  if (!val) return undefined;
  const normalized = val.toString().toLowerCase().trim();
  return validValues.find(v => v.toLowerCase() === normalized);
};

router.post('/upload-excel', excelUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No Excel file uploaded.' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const createdSpaces = [];
    const failedRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const formattedRow = {};

      for (const [header, value] of Object.entries(row)) {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const modelKey = normalizedMap[normalizedHeader];
        if (!modelKey) continue;

        if (['price', 'footfall', 'unit', 'occupiedUnits', 'width', 'height'].includes(modelKey)) {
          formattedRow[modelKey] = parseNumber(value);
        } else if (modelKey === 'dates') {
          formattedRow[modelKey] = typeof value === 'string'
            ? value.split(',').map(d => d.trim())
            : [];
        } else if (modelKey === 'traded' || modelKey === 'overlappingBooking') {
          formattedRow[modelKey] = value?.toString().toLowerCase() === 'true';
        } else if (ENUMS[modelKey]) {
          formattedRow[modelKey] = enumFix(value, ENUMS[modelKey]);
        } else {
          formattedRow[modelKey] = value?.toString().trim();
        }
      }

      // Add fallback for spaceName
      if (!formattedRow.spaceName) {
        formattedRow.spaceName = `Unnamed Space ${i + 1}`;
      }

      try {
        const space = new Space(formattedRow);
        await space.save();
        createdSpaces.push(space);
      } catch (err) {
        console.warn(`Row ${i + 2} skipped:`, err.message);
        failedRows.push({ row: i + 2, error: err.message });
      }
    }

    return res.status(207).json({
      message: 'Upload complete with flexible column and enum handling',
      createdCount: createdSpaces.length,
      skippedCount: failedRows.length,
      failedRows
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    return res.status(500).json({
      error: 'Something went wrong during Excel processing.',
      details: error.message
    });
  }
});

router.get('/selectcampaignSpaces', async (req, res) => {
  try {
    const spaces = await Space.find({}, {
      spaceName: 1,
      faciaTowards: 1,
      city: 1,
      category: 1,
      spaceType: 1,
      unit: 1,
      occupiedUnits: 1,
      ownershipType: 1,
      price: 1,
      traded: 1,
      overlappingBooking: 1,
      dates: 1,
      mainPhoto:1
    });

    res.json(spaces);
  } catch (error) {
    console.error('Error fetching optimized spaces:', error);
    res.status(500).json({ error: 'Failed to fetch space data' });
  }
});



// router.post('/upload-excel', excelUpload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No Excel file uploaded.' });
//   }

//   try {
//     const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     const createdSpaces = [];
//     const failedRows = [];

//     const parseNumber = (val) => {
//       const num = Number(val);
//       return isNaN(num) ? undefined : num;
//     };

//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];

//       const spaceData = {
//         spaceName: row.spaceName?.toString().trim() || `Unnamed Space ${i + 1}`,
//         spaceType: row.spaceType || 'Billboard',
//         category: row.category || 'Retail',
//         mediaType: row.mediaType || 'Static',
//         price: parseNumber(row.price),
//         footfall: parseNumber(row.footfall),
//         unit: parseNumber(row.unit),
//         occupiedUnits: parseNumber(row.occupiedUnits),
//         address: row.address,
//         city: row.city,
//         state: row.state,
//         zone: row.zone,
//         audience: row.audience,
//         demographics: row.demographics,
//         availability: row.availability || 'Completely available',
//         dates: typeof row.dates === 'string' ? row.dates.split(',').map(d => d.trim()) : [],
//       };

//       try {
//         const space = new Space(spaceData);
//         await space.save();
//         createdSpaces.push(space);
//       } catch (err) {
//         console.warn(`Row ${i + 2} skipped:`, err.message);
//         failedRows.push({ row: i + 2, error: err.message });
//       }
//     }

//     return res.status(207).json({
//       message: 'Upload complete with soft validation',
//       createdCount: createdSpaces.length,
//       skippedCount: failedRows.length,
//       failedRows,
//     });

//   } catch (error) {
//     console.error('Excel upload error:', error);
//     return res.status(500).json({
//       error: 'Something went wrong during Excel processing.',
//       details: error.message
//     });
//   }
// });
router.get('/',authenticate,async (req, res) => {
    try {
      const spaces = await Space.find();
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch spaces', details: error.message });
    }
  });

// router.get('/listInventory', authenticate, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || '';

//     const projection = {
//       spaceName: 1,
//       address: 1,
//       city: 1,
//       state: 1,
//       zone: 1,
//       spaceType: 1,
//       unit: 1,
//       occupiedUnits: 1,
//       availability: 1,
//       footfall: 1,
//       audience: 1,
//       demographics: 1,
//       dates: 1,
//       tags: 1,
//       mainPhoto: 1,
//       overlappingBooking: 1,
//       createdAt: 1,
//     };

//     const searchQuery = search
//       ? {
//           $or: [
//             { spaceName: { $regex: search, $options: 'i' } },
//             { address: { $regex: search, $options: 'i' } },
//             { city: { $regex: search, $options: 'i' } },
//             { state: { $regex: search, $options: 'i' } },
//             { zone: { $regex: search, $options: 'i' } },
//             { tags: { $regex: search, $options: 'i' } },
//           ],
//         }
//       : {};

//     const [spaces, totalCount] = await Promise.all([
//       Space.find(searchQuery, projection).skip(skip).limit(limit).sort({ createdAt: -1 }),
//       Space.countDocuments(searchQuery),
//     ]);

//     res.json({ spaces, totalCount });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch spaces', details: error.message });
//   }
// });


router.get('/listInventory', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const region = req.query.region || '';
    const availability = req.query.availability || '';
    const spaceType = req.query.spaceType || '';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const projection = {
      spaceName: 1,
      address: 1,
      city: 1,
      state: 1,
      zone: 1,
      spaceType: 1,
      unit: 1,
      occupiedUnits: 1,
      availability: 1,
      footfall: 1,
      audience: 1,
      demographics: 1,
      dates: 1,
      tags: 1,
      mainPhoto: 1,
      overlappingBooking: 1,
      createdAt: 1,
      campaignDates: 1,
    };

    const filters = {};

    // Search text
    if (search) {
      filters.$or = [
        { spaceName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { zone: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Region filter (match in city, state, or zone)
    if (region) {
      filters.$and = filters.$and || [];
      filters.$and.push({
        $or: [
          { city: { $regex: region, $options: 'i' } },
          { state: { $regex: region, $options: 'i' } },
          { zone: { $regex: region, $options: 'i' } },
        ],
      });
    }

    // Space Type
    if (spaceType) {
      filters.spaceType = spaceType;
    }

    // Availability (we compute after fetching below)
    const rawData = await Space.find(filters, projection).sort({ createdAt: -1 });
    const totalFiltered = rawData.length;

    // Date Filter + Availability Logic
    const filtered = rawData.filter((item) => {
      // Computed availability
      const totalUnits = item.unit || 0;
      const occupied = item.occupiedUnits || 0;
      let computedAvailability = 'Completely available';
      if (item.overlappingBooking) computedAvailability = 'Overlapping booking';
      else if (totalUnits === occupied && occupied !== 0) computedAvailability = 'Completely booked';
      else if (occupied > 0 && occupied < totalUnits) computedAvailability = 'Partially available';

      if (availability && computedAvailability !== availability) return false;

      // Date filtering
      if (startDate && endDate && item.dates?.length >= 2) {
        const [d1, m1, y1] = item.dates[0].split('-');
        const [d2, m2, y2] = item.dates[1].split('-');
        const invStart = new Date(`${y1}-${m1}-${d1}`);
        const invEnd = new Date(`${y2}-${m2}-${d2}`);
        const selectedStart = new Date(startDate);
        const selectedEnd = new Date(endDate);

        const inRange = selectedStart >= invStart && selectedEnd <= invEnd;

        const overlapWithCampaign = (item.campaignDates || []).some(c => {
          const campStart = new Date(c.startDate);
          const campEnd = new Date(c.endDate);
          return selectedStart <= campEnd && selectedEnd >= campStart;
        });

        if (!inRange || overlapWithCampaign) return false;
      }

      return true;
    });

    const paginated = filtered.slice(skip, skip + limit);
    res.json({ spaces: paginated, totalCount: filtered.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spaces', details: error.message });
  }
});


// router.get('/', authenticate, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = req.query.search || '';
//     const region = req.query.region || '';
//     const availability = req.query.availability || '';
//     const spaceType = req.query.spaceType || '';
//     const startDate = req.query.startDate;
//     const endDate = req.query.endDate;

//     const projection = {
//       spaceName: 1,
//       address: 1,
//       city: 1,
//       state: 1,
//       zone: 1,
//       spaceType: 1,
//       unit: 1,
//       occupiedUnits: 1,
//       availability: 1,
//       footfall: 1,
//       audience: 1,
//       demographics: 1,
//       dates: 1,
//       tags: 1,
//       mainPhoto: 1,
//       overlappingBooking: 1,
//       createdAt: 1,
//       campaignDates: 1,
//     };

//     const filters = {};

//     // Search text
//     if (search) {
//       filters.$or = [
//         { spaceName: { $regex: search, $options: 'i' } },
//         { address: { $regex: search, $options: 'i' } },
//         { city: { $regex: search, $options: 'i' } },
//         { state: { $regex: search, $options: 'i' } },
//         { zone: { $regex: search, $options: 'i' } },
//         { tags: { $regex: search, $options: 'i' } },
//       ];
//     }

//     // Region filter (match in city, state, or zone)
//     if (region) {
//       filters.$and = filters.$and || [];
//       filters.$and.push({
//         $or: [
//           { city: { $regex: region, $options: 'i' } },
//           { state: { $regex: region, $options: 'i' } },
//           { zone: { $regex: region, $options: 'i' } },
//         ],
//       });
//     }

//     // Space Type
//     if (spaceType) {
//       filters.spaceType = spaceType;
//     }

//     // Availability (we compute after fetching below)
//     const rawData = await Space.find(filters, projection).sort({ createdAt: -1 });
//     const totalFiltered = rawData.length;

//     // Date Filter + Availability Logic
//     const filtered = rawData.filter((item) => {
//       // Computed availability
//       const totalUnits = item.unit || 0;
//       const occupied = item.occupiedUnits || 0;
//       let computedAvailability = 'Completely available';
//       if (item.overlappingBooking) computedAvailability = 'Overlapping booking';
//       else if (totalUnits === occupied && occupied !== 0) computedAvailability = 'Completely booked';
//       else if (occupied > 0 && occupied < totalUnits) computedAvailability = 'Partially available';

//       if (availability && computedAvailability !== availability) return false;

//       // Date filtering
//       if (startDate && endDate && item.dates?.length >= 2) {
//         const [d1, m1, y1] = item.dates[0].split('-');
//         const [d2, m2, y2] = item.dates[1].split('-');
//         const invStart = new Date(`${y1}-${m1}-${d1}`);
//         const invEnd = new Date(`${y2}-${m2}-${d2}`);
//         const selectedStart = new Date(startDate);
//         const selectedEnd = new Date(endDate);

//         const inRange = selectedStart >= invStart && selectedEnd <= invEnd;

//         const overlapWithCampaign = (item.campaignDates || []).some(c => {
//           const campStart = new Date(c.startDate);
//           const campEnd = new Date(c.endDate);
//           return selectedStart <= campEnd && selectedEnd >= campStart;
//         });

//         if (!inRange || overlapWithCampaign) return false;
//       }

//       return true;
//     });

//     const paginated = filtered.slice(skip, skip + limit);
//     res.json({ spaces: paginated, totalCount: filtered.length });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch spaces', details: error.message });
//   }
// });


  router.get('/dashboard-stats', async (req, res) => {
  try {
    const spaces = await Space.find({}, {
      spaceType: 1,
      unit: 1,
      occupiedUnits: 1,
      overlappingBooking: 1
    });

    // DOOH Utilization
    let totalUnits = 0;
    let bookedUnits = 0;

    // Static Site Availability
    let available = 0;
    let booked = 0;
    let overlapping = 0;

    spaces.forEach(space => {
      const units = space.unit || 0;
      const occupied = space.occupiedUnits || 0;

      if (space.spaceType === 'DOOH') {
        totalUnits += units;
        bookedUnits += occupied;
      } else {
        if (occupied === 0) {
          available++;
        } else if (space.overlappingBooking) {
          overlapping++;
        } else {
          booked++;
        }
      }
    });

    const dashboardStats = {
      doohUtilization: {
        totalUnits,
        bookedUnits,
        freeUnits: totalUnits - bookedUnits
      },
      staticAvailability: {
        available,
        booked,
        overlapping
      }
    };

    res.json(dashboardStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute dashboard stats', details: error.message });
  }
});
  
  // READ ONE - GET /api/space/:id
  router.get('/:id', async (req, res) => {
    try {
      const space = await Space.findById(req.params.id);
      if (!space) return res.status(404).json({ error: 'Space not found' });
      res.json(space);
    } catch (error) {
      console.error('Error fetching space by ID:', error);
      res.status(500).json({ error: 'Failed to fetch space', details: error.message });
    }
  });
  router.put('/:id/add-tag', async (req, res) => {
  const { tag } = req.body;
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Not found' });

    space.tags = space.tags ? `${space.tags}, ${tag}` : tag;
    await space.save();
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/spaces/:id/remove-tag
router.put('/:id/remove-tag', async (req, res) => {
  const { tag } = req.body;
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ message: 'Not found' });

    const tagList = (space.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t && t !== tag);

    space.tags = tagList.join(', ');
    await space.save();
    res.status(200).json(space);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
 

  // PUT /api/spaces/:id
router.put('/:id', upload.fields([
  { name: 'mainPhoto', maxCount: 1 },
  { name: 'longShot', maxCount: 1 },
  { name: 'closeShot', maxCount: 1 },
  { name: 'otherPhotos', maxCount: 10 }
]), async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Update normal text fields
    for (const key in req.body) {
      space[key] = req.body[key];
    }

    // Update photos if new ones are uploaded
    if (req.files['mainPhoto']) {
      space.mainPhoto = req.files['mainPhoto'][0].filename;
    }
    if (req.files['longShot']) {
      space.longShot = req.files['longShot'][0].filename;
    }
    if (req.files['closeShot']) {
      space.closeShot = req.files['closeShot'][0].filename;
    }
    if (req.files['otherPhotos']) {
      space.otherPhotos = req.files['otherPhotos'].map(file => file.filename);
    }

    await space.save();
    res.json(space);
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//   router.put('/:id/printingStatus', async (req, res) => {
//   try {
//     const space = await Space.findById(req.params.id);
//     if (!space) {
//       return res.status(404).json({ error: 'Space not found' });
//     }

//     space.printingStatus.confirmed = true;
//     await space.save();

//     res.json(space);
//   } catch (error) {
//     console.error('Error updating printing status:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
router.put('/:id/printingStatus', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    const {
      confirmed,
      printingDate,
      assignedPerson,
      assignedAgency,
      printingMaterial,
      note
    } = req.body;

    // Update fields only if they are provided
    if (confirmed !== undefined) space.printingStatus.confirmed = confirmed;
    if (printingDate !== undefined) space.printingStatus.printingDate = printingDate;
    if (assignedPerson !== undefined) space.printingStatus.assignedPerson = assignedPerson;
    if (assignedAgency !== undefined) space.printingStatus.assignedAgency = assignedAgency;
    if (printingMaterial !== undefined) space.printingStatus.printingMaterial = printingMaterial;
    if (note !== undefined) space.printingStatus.note = note;

    await space.save();

    res.json(space);
  } catch (error) {
    console.error('Error updating printing status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Confirm mounting status on space (Safe isolated route)
// router.put('/:id/mountingStatus', async (req, res) => {
//   try {
//     const space = await Space.findById(req.params.id);
//     if (!space) {
//       return res.status(404).json({ error: 'Space not found' });
//     }

//     space.mountingStatus.confirmed = true;
//     await space.save();

//     res.json(space);
//   } catch (error) {
//     console.error('Error updating mounting status:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

router.put('/:id/mountingStatus', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    const {
      confirmed,
      receivedDate,
      assignedPerson,
      assignedAgency,
      note
    } = req.body;

    if (confirmed !== undefined) space.mountingStatus.confirmed = confirmed;
    if (receivedDate !== undefined) space.mountingStatus.mountingDate = receivedDate;
    if (assignedPerson !== undefined) space.mountingStatus.assignedPerson = assignedPerson;
    if (assignedAgency !== undefined) space.mountingStatus.assignedAgency = assignedAgency;
    if (note !== undefined) space.mountingStatus.note = note;

    await space.save();

    res.json(space);
  } catch (error) {
    console.error('Error updating mounting status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

 
  // DELETE /api/spaces/:id
router.delete('/:id', async (req, res) => {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }
    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
