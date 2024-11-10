const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  last_edited: { type: Date, default: Date.now },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Post', postSchema); 