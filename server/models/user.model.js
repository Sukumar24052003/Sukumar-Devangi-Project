import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // no duplicate emails
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone:{
    type: String,
  },
  name: {
    type: String,
    required: true,
    trim:true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

const User = mongoose.model('User', userSchema);

export default User;
