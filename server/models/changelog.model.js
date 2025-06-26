import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const changeLogSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },// The user making the change
  userEmail:{type: String, required: true},  
  userName:{type: String, required: true},  
  changeType: { type: String, required: true },  // Booking Status, PO Status, etc.
  previousValue: { type: Schema.Types.Mixed },  // Previous value before update
  newValue: { type: Schema.Types.Mixed },  // New value after update
  timestamp: { type: Date, default: Date.now },  // When the change was made
}, {
  timestamps: true,
});

const ChangeLog = model('ChangeLog', changeLogSchema);

export default ChangeLog;
