import Pipeline from '../models/pipeline.model.js';
import Campaign from '../models/campign.model.js';
import Space from '../models/space.model.js';
import { uploadToS3 } from '../utils/s3uploader.js';
/**
 * Get pipeline by Campaign ID
 */
// export const getPipelineByCampaignId = async (req, res) => {
//   const { campaignId } = req.params;
//   try {
//     const pipeline = await Pipeline.findOne({ campaign: campaignId }).populate('spaces');
//     if (!pipeline) {
//       return res.status(404).json({ error: 'Pipeline not found' });
//     }
//     res.json(pipeline);
//   } catch (error) {
//     res.status(500).json({ error: error.message || 'Failed to fetch pipeline' });
//   }
// };

export const getPipelineByCampaignId = async (req, res) => {
  const { campaignId } = req.params;
  try {
    const pipeline = await Pipeline.findOne({ campaign: campaignId })
      .populate('spaces')
      .populate({
        path: 'campaign',
        select: 'inventoryCosts', // only fetch inventoryCosts field
      });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch pipeline' });
  }
};

export const createPipelineForCampaign = async (req, res) => {
  const { campaignId } = req.params;
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if already exists
    let existingPipeline = await Pipeline.findOne({ campaign: campaignId });
    if (existingPipeline) {
      // ✅ Ensure campaign is linked (in case it's not)
      if (!campaign.pipeline) {
        campaign.pipeline = existingPipeline._id;
        await campaign.save();
      }
      return res.status(200).json(existingPipeline);
    }

    // Create new pipeline
    const newPipeline = new Pipeline({
      campaign: campaignId,
      spaces: campaign.spaces.map(s => s.id),
      bookingStatus: { confirmed: false, reference: '' },
      po: { confirmed: false, documentUrl: '' },
      artwork: { confirmed: false, documentUrl: '' },
      invoice: { invoiceNumber: '', documentUrl: '' },
      payment: { payments: [], totalAmount: 0, totalPaid: 0, paymentDue: 0 },
    });

    await newPipeline.save();

    // ✅ Assign pipeline back to campaign
    campaign.pipeline = newPipeline._id;
    await campaign.save();

    res.status(201).json(newPipeline);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create pipeline' });
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res) => {
 console.log("Booking files recieved are",req.file);
      if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      // ✅ Upload file to S3
      let fileUrl = '';
      try {
        fileUrl = await uploadToS3(req.file.path, req.file.filename);
      } catch (uploadErr) {
        console.error('S3 upload failed:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload artwork to S3' });
      }
  const { campaignId } = req.params;
  const { confirmed, reference,bookingDate,estimateDocument} = req.body;
console.log("One for booking status")
  try {
    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      { bookingStatus: { confirmed, reference,bookingDate,estimateDocument:fileUrl } },
      { new: true }
    );
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update booking status' });
  }
};

/**
 * Confirm Artwork
 */

export const confirmArtwork = async (req, res) => {
  const { campaignId } = req.params;
  const { receivedDate } = req.body;

  try {
    const updateData = {
      'artwork.confirmed': true,
      ...(receivedDate && { 'artwork.receivedDate': receivedDate }),
    };

    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      updateData,
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.status(200).json(pipeline);
  } catch (error) {
    console.error('Error confirming artwork:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm artwork' });
  }
};

/**
 * Confirm Printing Status
 */

// export const confirmPrintingStatus = async (req, res) => {
//   const { campaignId } = req.params;
//   const { printingDate } = req.body;

//   try {
//     const updateData = {
//       'printingStatus.confirmed': true,
//       ...(printingDate && { 'printingStatus.printingDate': printingDate }),
//     };

//     const pipeline = await Pipeline.findOneAndUpdate(
//       { campaign: campaignId },
//       updateData,
//       { new: true }
//     );

//     if (!pipeline) {
//       return res.status(404).json({ error: 'Pipeline not found' });
//     }

//     res.status(200).json(pipeline);
//   } catch (error) {
//     console.error('Error confirming printing status:', error);
//     res.status(500).json({ error: error.message || 'Failed to confirm printing status' });
//   }
// };



export const confirmPrintingStatus = async (req, res) => {
  const { spaceId } = req.params;
  const {
    confirmed,
    printingDate,
    assignedPerson,
    assignedAgency,
    printingMaterial,
    note
  } = req.body;
console.log("Payload recieved in backend is",req.body);
  try {
    const updateData = {
      'printingStatus.confirmed': confirmed ?? true,
      ...(printingDate && { 'printingStatus.printingDate': printingDate }),
      ...(assignedPerson && { 'printingStatus.assignedPerson': assignedPerson }),
      ...(assignedAgency && { 'printingStatus.assignedAgency': assignedAgency }),
      ...(printingMaterial && { 'printingStatus.printingMaterial': printingMaterial }),
      ...(note && { 'printingStatus.note': note }),
    };

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.status(200).json(updatedSpace);
  } catch (error) {
    console.error('Error confirming printing status:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm printing status' });
  }
};

/**
 * Confirm Mounting Status
 */
// export const confirmMountingStatus = async (req, res) => {
//   const { campaignId } = req.params;
//   try {
//     const pipeline = await Pipeline.findOneAndUpdate(
//       { campaign: campaignId },
//       { 'mountingStatus.confirmed': true },
//       { new: true }
//     );
//     res.json(pipeline);
//   } catch (error) {
//     res.status(500).json({ error: error.message || 'Failed to confirm mounting status' });
//   }
// };

export const confirmMountingStatus = async (req, res) => {
  const { spaceId } = req.params;
  const {
    confirmed,
    receivedDate,
    assignedPerson,
    assignedAgency,
    note
  } = req.body;

  try {
    const updateData = {
      'mountingStatus.confirmed': confirmed ?? true,
      ...(receivedDate && { 'mountingStatus.mountingDate': receivedDate }),
      ...(assignedPerson && { 'mountingStatus.assignedPerson': assignedPerson }),
      ...(assignedAgency && { 'mountingStatus.assignedAgency': assignedAgency }),
      ...(note && { 'mountingStatus.note': note }),
    };

    const updatedSpace = await Space.findByIdAndUpdate(
      spaceId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedSpace) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.status(200).json(updatedSpace);
  } catch (error) {
    console.error('Error confirming mounting status:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm mounting status' });
  }
};
export const uploadInvoice = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ✅ Upload to S3
    let fileUrl = '';
    try {
      fileUrl = await uploadToS3(req.file.path, req.file.filename);
    } catch (uploadErr) {
      console.error('S3 upload failed:', uploadErr);
      return res.status(500).json({ error: 'Failed to upload invoice to S3' });
    }

    // ✅ Update pipeline document with invoice URL
    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      { 'invoice.documentUrl': fileUrl },
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found for this campaign' });
    }

    res.status(200).json(pipeline);
  } catch (err) {
    console.error('Invoice upload failed:', err);
    res.status(500).json({ error: 'Server error during invoice upload' });
  }
};




export const updateInvoice = async (req, res) => {
  try {
    const { invoiceNumber, invoiceDate, invoiceValue } = req.body;
    const campaignId = req.params.campaignId;

    const updateData = {
      ...(invoiceNumber && { 'invoice.invoiceNumber': invoiceNumber }),
      ...(invoiceDate && { 'invoice.invoiceDate': invoiceDate }),
      ...(invoiceValue && { 'invoice.invoiceValue': invoiceValue }),
    };

    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      updateData,
      { new: true }
    );

    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    res.status(200).json(pipeline);
  } catch (err) {
    console.error('Error updating invoice details:', err);
    res.status(500).json({ error: 'Server error during invoice update' });
  }
};


// export const updatePayment = async (req, res) => {
//   try {
//     const campaignId = req.params.campaignId;
//     const {
//       totalAmount,
//       modeOfPayment,
//       payments = [],
//       totalPaid,
//       paymentDue
//     } = req.body;

//     const pipeline = await Pipeline.findOneAndUpdate(
//       { campaign: campaignId },
//       {
//         payment: {
//           totalAmount,
//           modeOfPayment,
//           payments,
//           totalPaid,
//           paymentDue
//         }
//       },
//       { new: true }
//     );

//     if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

//     res.status(200).json(pipeline);
//   } catch (err) {
//     console.error('Error updating payment:', err);
//     res.status(500).json({ error: 'Server error during payment update' });
//   }
// };

// export const uploadPoDocument = async (req, res) => {
//   try {
//     const campaignId = req.params.campaignId;
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const pipeline = await Pipeline.findOneAndUpdate(
//       { campaign: campaignId },
//       { 'po.documentUrl': `/uploads/${req.file.filename}` },
//       { new: true }
//     );

//     if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

//     res.status(200).json(pipeline);
//   } catch (err) {
//     console.error('Error uploading PO document:', err);
//     res.status(500).json({ error: 'Server error during PO upload' });
//   }
// };

export const updatePayment = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const {
      totalAmount,
      payments = [],
      totalPaid,
      paymentDue
    } = req.body;

    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      {
        payment: {
          totalAmount,
          payments,
          totalPaid,
          paymentDue
        }
      },
      { new: true }
    );

    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    res.status(200).json(pipeline);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ error: 'Server error during payment update' });
  }
};

export const uploadPoDocument = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ✅ Upload to S3
    let fileUrl = '';
    try {
      fileUrl = await uploadToS3(req.file.path, req.file.filename); // returns public S3 URL
    } catch (uploadErr) {
      console.error('S3 upload failed:', uploadErr);
      return res.status(500).json({ error: 'Failed to upload PO document to S3' });
    }

    // ✅ Save public S3 URL to pipeline.po.documentUrl
    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      { 'po.documentUrl': fileUrl },
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.status(200).json(pipeline);
  } catch (err) {
    console.error('Error uploading PO document:', err);
    res.status(500).json({ error: 'Server error during PO upload' });
  }
};

// ✅ Confirm PO received (updates po.confirmed: true)

export const confirmPoStatus = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const {
      confirmed,
      poNumber,
      poDate,
      poValue
    } = req.body;

    const updateData = {
      'po.confirmed': confirmed === true || confirmed === 'true',
      ...(poNumber && { 'po.poNumber': poNumber }),
      ...(poDate && { 'po.poDate': poDate }),
      ...(poValue && { 'po.poValue': poValue }),
    };

    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: campaignId },
      updateData,
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.status(200).json(pipeline);
  } catch (err) {
    console.error('Error confirming PO status:', err);
    res.status(500).json({ error: 'Server error during PO confirmation' });
  }
};


export const deletePipelineAndCleanup = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const pipeline = await Pipeline.findOne({ campaign: campaignId });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Optional cleanup: reset statuses in each space
    if (Array.isArray(pipeline.spaces)) {
      await Promise.all(
        pipeline.spaces.map(async (spaceId) => {
          await Space.findByIdAndUpdate(spaceId, {
            $set: {
              'printingStatus.confirmed': false,
              'mountingStatus.confirmed': false
            }
          });
        })
      );
    }

    // Delete pipeline
    await Pipeline.deleteOne({ _id: pipeline._id });

    return res.status(200).json({ message: 'Pipeline and associated space statuses deleted successfully' });
  } catch (err) {
    console.error('Error deleting pipeline:', err);
    return res.status(500).json({ error: 'Server error during pipeline deletion' });
  }
};