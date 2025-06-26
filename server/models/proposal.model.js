import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProposalSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  clientName: { type: String },
  clientEmail: {
    type: String,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  clientPanNumber: { type: String },
  clientGstNumber: { type: String },
  clientContactNumber: { type: Number },
  brandDisplayName: { type: String },
  clientType: { type: String },
  // campaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
  industry: {
    type: String,
    enum: ['Automotive', 'Clothing and Apparel', 'Ecommerce', 'Edtech', 'Entertainment', 'FMCG']
  },
  description: { type: String },
  spaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Space' }]


}, {
  timestamps: true
});

const Proposal = mongoose.model('Proposal', ProposalSchema);
export default Proposal;
