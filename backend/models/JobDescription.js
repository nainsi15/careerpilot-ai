const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Target Job Description' },
  rawText: { type: String, required: true },
  normalizedData: { type: Object, required: true },
  isVague: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
