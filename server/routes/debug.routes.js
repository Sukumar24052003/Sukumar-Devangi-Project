import { Router } from 'express';
import Campaign from '../models/campign.model.js';
const router=Router();
router.get('/pipeline/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findById(id).populate('pipeline');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // console.dir(campaign, { depth: null });

    return res.json({
      message: 'Pipeline population successful',
      pipeline: campaign.pipeline,
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});
export default router;