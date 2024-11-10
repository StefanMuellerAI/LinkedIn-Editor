const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['basis', 'premium', 'admin'], default: 'basis' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 