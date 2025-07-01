// src/routes/pipeline.routes.js

import express from 'express';
import {
  getPipelineByCampaignId,
  createPipelineForCampaign,
  updateBookingStatus,
  confirmArtwork,
  confirmPrintingStatus,
  confirmMountingStatus, uploadInvoice, updateInvoice, updatePayment, uploadPoDocument, confirmPoStatus, deletePipelineAndCleanup
} from '../controllers/pipeline.controller.js';
import upload from '../middleware/multer.middleware.js';
import { uploadToS3 } from '../utils/s3uploader.js';
import Campaign from '../models/campign.model.js';
const router = express.Router();
// import Pipeline from '../models/pipeline.model.js'; // <--- THIS IS THE PROBLEM. REMOVE THIS LINE.
import ChangeLog from '../models/changelog.model.js';
import Booking from '../models/booking.model.js';
import moment from 'moment';
import mongoose from 'mongoose';


router.get('/campaign/:campaignId', getPipelineByCampaignId);

// This route uses `Pipeline` directly, so we need to import it here.
// To avoid the error, we can import it from mongoose.models instead of the file directly.
const Pipeline = mongoose.model('Pipeline');

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

router.put('/campaign/:campaignId/bookingStatus', upload.single('file'), updateBookingStatus);
router.put('/campaign/:campaignId/artwork', confirmArtwork);

router.post('/campaign/:campaignId/artwork/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileUrl = '';
    try {
      fileUrl = await uploadToS3(req.file.path, req.file.filename);
    } catch (uploadErr) {
      console.error('S3 upload failed:', uploadErr);
      return res.status(500).json({ error: 'Failed to upload artwork to S3' });
    }

    const pipeline = await Pipeline.findOneAndUpdate(
      { campaign: req.params.campaignId },
      { 'artwork.image': fileUrl, 'artwork.confirmed': true },
      { new: true }
    );

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found for the campaign' });
    }

    res.status(200).json({ message: 'Artwork uploaded', imageUrl: fileUrl, pipeline });

  } catch (error) {
    console.error('Artwork upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload artwork' });
  }
});
router.put('/campaign/:campaignId/printingStatus', confirmPrintingStatus);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/change-Log', async (req, res) => {
  const { campaignId, userId, userEmail, userName, changeType, previousValue, newValue } = req.body;

  if (!mongoose.Types.ObjectId.isValid(campaignId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid campaignId or userId' });
  }

  try {
    const changeLog = new ChangeLog({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      userId: new mongoose.Types.ObjectId(userId),
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

    const bookings = await Booking.find().select('campaigns companyName clientName');

    const campaignToBookingMap = {};
    bookings.forEach((booking) => {
      booking.campaigns.forEach((campaignId) => {
        campaignToBookingMap[campaignId.toString()] = {
          bookingName: booking.companyName,
          clientName: booking.clientName,
        };
      });
    });

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

router.put('/campaign/:id/update-costs', async (req, res) => {
  try {
    const { inventoryCosts } = req.body;

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { inventoryCosts },
      { new: true }
    );

    let totalAmount = 0;
    for (const cost of inventoryCosts) {
      const display = cost.displayCost || 0;
      const printing = (cost.printingcostpersquareFeet || 0) * (cost.area || 0);
      const mounting = (cost.mountingcostpersquareFeet || 0) * (cost.area || 0);
      const base = display + printing + mounting;
      const withGST = base * 1.18;
      totalAmount += withGST;
    }

    await Pipeline.findOneAndUpdate(
      { campaign: req.params.id },
      { 'payment.totalAmount': Math.round(totalAmount) },
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
      return res.status(200).json({ documentUrl: fileUrl });
    } catch (uploadErr) {
      console.error('S3 upload failed:', uploadErr);
      return res.status(500).json({ error: 'Failed to upload payment document to S3' });
    }
  }
);

router.post('/campaign/:campaignId/po/upload', upload.single('file'), uploadPoDocument);
router.put('/campaign/:campaignId/po', confirmPoStatus);
router.delete('/campaign/:campaignId', deletePipelineAndCleanup);


export default router;