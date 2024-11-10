const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  verwendungszweck: { type: String, required: true },
  inhalt: { type: String, required: true },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Template', templateSchema); 