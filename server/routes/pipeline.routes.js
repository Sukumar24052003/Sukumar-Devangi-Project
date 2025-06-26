import express from 'express';
import {
  getPipelineByCampaignId,
  createPipelineForCampaign,
  updateBookingStatus,
  confirmArtwork,
  confirmPrintingStatus,
  confirmMountingStatus,uploadInvoice,updateInvoice,updatePayment,uploadPoDocument,confirmPoStatus,deletePipelineAndCleanup
} from '../controllers/pipeline.controller.js';
import upload from '../middleware/multer.middleware.js';
import { uploadToS3 } from '../utils/s3uploader.js';
import Campaign from '../models/campign.model.js';
const router = express.Router();
import Pipeline from '../models/pipeline.model.js';
import ChangeLog from '../models/changelog.model.js';
import Booking from '../models/booking.model.js';
import moment from 'moment';
import mongoose from 'mongoose';


router.get('/campaign/:campaignId', getPipelineByCampaignId);
router.get('/finance', async (req, res) => {
  try {
    const pipelines = await Pipeline.find({}).select('po invoice createdAt');

    const grouped = {};

    pipelines.forEach((p) => {
      const createdAt = moment(p.createdAt);
      const year = createdAt.year();
      const month = createdAt.format('MMMM');

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = { purchaseOrders: [], invoices: [] };

      if (p.po?.documentUrl) {
        grouped[year][month].purchaseOrders.push({
          documentName: p.po.reference || 'PO Document',
          fileUrl: p.po.documentUrl,
        });
      }

      if (p.invoice?.invoiceNumber) {
        grouped[year][month].invoices.push({
          documentName: p.invoice.invoiceNumber,
          fileUrl: p.invoice.documentUrl || null,
        });
      }
    });

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

router.post('/campaign/:campaignId', createPipelineForCampaign);

router.put('/campaign/:campaignId/bookingStatus', upload.single('file'),updateBookingStatus);
router.put('/campaign/:campaignId/artwork', confirmArtwork);

router.post('/campaign/:campaignId/artwork/upload', upload.single('file'), async (req, res) => {
  try {
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

    // ✅ Update pipeline document
    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: req.params.campaignId },
      { 'artwork.documentUrl': fileUrl },
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found for the campaign' });
    }

    res.status(200).json({ message: 'Artwork uploaded', documentUrl: fileUrl, pipeline });

  } catch (error) {
    console.error('Artwork upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload artwork' });
  }
});
router.put('/campaign/:campaignId/printingStatus', confirmPrintingStatus);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);



// router.post('/campaign/changeLog', async (req, res) => {
//   console.log('Received request body:', req.body);  // Log the complete request body
//   const { campaignId, userId, userEmail, userName, changeType, previousValue, newValue } = req.body;

//   // Ensure campaignId and userId are valid ObjectIds
//   if (!mongoose.Types.ObjectId.isValid(campaignId)) {
//     console.log('Invalid campaignId:', campaignId);  // Log invalid campaignId
//     return res.status(400).send({ message: 'Invalid campaignId' });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.log('Invalid userId:', userId);  // Log invalid userId
//     return res.status(400).send({ message: 'Invalid userId' });
//   }

//   try {
//     // No need to explicitly cast here if you've already validated
//     const changeLog = new ChangeLog({
//       campaignId: mongoose.Types.ObjectId(campaignId),  // Cast to ObjectId
//       userId: mongoose.Types.ObjectId(userId),  // Cast to ObjectId
//       userEmail,
//       userName,
//       changeType,
//       previousValue,
//       newValue,
//     });

//     await changeLog.save();
//     res.status(201).send({ message: 'Change log saved successfully' });
//   } catch (err) {
//     console.error('Error saving change log:', err);
//     res.status(500).send({ message: 'Error saving change log' });
//   }
// });
router.post('/change-Log', async(req, res) => {
  console.log('Received test request body:', req.body);
  const { campaignId, userId, userEmail, userName, changeType, previousValue, newValue } = req.body;

  // Ensure campaignId and userId are valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    console.log('Invalid campaignId:', campaignId);  // Log invalid campaignId
    return res.status(400).send({ message: 'Invalid campaignId' });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('Invalid userId:', userId);  // Log invalid userId
    return res.status(400).send({ message: 'Invalid userId' });
  }

  try {
    // No need to explicitly cast here if you've already validated
    const changeLog = new ChangeLog({
      campaignId: new mongoose.Types.ObjectId(campaignId),  // Cast to ObjectId
userId: new mongoose.Types.ObjectId(userId),  // Cast to ObjectId
      userEmail,
      userName,
      changeType,
      previousValue,
      newValue,
    });

    await changeLog.save();
    res.status(201).send({ message: 'Change log saved successfully' });
  } catch (err) {
    console.error('Error saving change log:', err);
    res.status(500).send({ message: 'Error saving change log' });
  }
});

router.get('/change-Log', async (req, res) => {
  try {
    const changelogs = await ChangeLog.find()
      .sort({ createdAt: -1 })
      .populate('campaignId', 'campaignName')
      .populate('userId', 'name');

    // Fetch all bookings with their campaigns
    const bookings = await Booking.find().select('campaigns companyName clientName');

    // Map campaignId to booking info
    const campaignToBookingMap = {};
    bookings.forEach((booking) => {
      booking.campaigns.forEach((campaignId) => {
        campaignToBookingMap[campaignId.toString()] = {
          bookingName: booking.companyName,
          clientName: booking.clientName,
        };
      });
    });

    // Attach booking/client info to each changelog
    const enrichedLogs = changelogs.map((log) => {
      const bookingInfo = campaignToBookingMap[log.campaignId?._id?.toString()] || {};
      return {
        ...log.toObject(),
        bookingName: bookingInfo.bookingName || null,
        clientName: bookingInfo.clientName || null,
      };
    });

    res.json({ changelogs: enrichedLogs });
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.put('/campaign/:campaignId/mountingStatus', confirmMountingStatus);
router.post('/campaign/:campaignId/invoice/upload', upload.single('file'), uploadInvoice);
router.put('/campaign/:campaignId/invoice', updateInvoice);

// Payment Route
 
router.put('/campaign/:id/update-costs', async (req, res) => {
  try {
    const { inventoryCosts } = req.body;

    // Update campaign inventoryCosts
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { inventoryCosts },
      { new: true }
    );

    // Calculate total cost with 18% GST
    let totalAmount = 0;

    for (const cost of inventoryCosts) {
      const display = cost.displayCost || 0;
      const printing = (cost.printingcostpersquareFeet || 0) * (cost.area || 0);
      const mounting = (cost.mountingcostpersquareFeet || 0) * (cost.area || 0);
      const base = display + printing + mounting;
      const withGST = base * 1.18;
      totalAmount += withGST;
    }

    // Update payment.totalAmount in related pipeline
    await Pipeline.findOneAndUpdate(
      { campaign: req.params.id },
      { 'payment.totalAmount': Math.round(totalAmount) }, // round if needed
      { new: true }
    );

    res.json({ campaign });
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/campaign/:campaignId/payment', updatePayment);

router.post(
  '/campaign/:campaignId/payment/upload',
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const fileUrl = await uploadToS3(req.file.path, req.file.filename);

      // Just return the S3 file URL to the frontend
      return res.status(200).json({ documentUrl: fileUrl });
    } catch (uploadErr) {
      console.error('S3 upload failed:', uploadErr);
      return res.status(500).json({ error: 'Failed to upload payment document to S3' });
    }
  }
);

// PO Document Upload and Confirmation
router.post('/campaign/:campaignId/po/upload', upload.single('file'), uploadPoDocument);
router.put('/campaign/:campaignId/po', confirmPoStatus);
router.delete('/campaign/:campaignId', deletePipelineAndCleanup);


export default router;
