
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bookingSchema = new Schema({
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
  bookingMode: { type: String },
  bookingSource: { type: String },
  reminderTimeline:{type:Number},
  isFOCBooking:{type:Boolean,default:false},

  industry: {
    type: String,
    enum: ['Automotive', 'Clothing & Apparel', 'Ecommerce', 'EdTech', 'Entertainment', 'FMCG']
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true  // optional: if every booking must have a user
},


   campaignImages: [String],
  campaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],  // ✅ One booking → many campaigns
  companyLogo: String,
}, {
  timestamps: true
});

const Booking = model('Booking', bookingSchema);

export default Booking;
