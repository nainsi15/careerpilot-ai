const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  
  atsScore: { type: Number, required: true },
  skillScore: { type: Number, default: 0 },
  semanticSimilarity: { type: Number, required: true },
  sectionScore: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 },
  
  shortlistReadiness: { type: String, required: true },
  detectedSections: [{ type: String }],
  strongSkills: [{ type: String }],
  missingSkills: [
    {
      skill: String,
      importance: String,
      learning_link: String
    }
  ],
  rewrittenBullets: [
    {
      original: String,
      improved: String,
      impact_factor: String
    }
  ],
  recruiterFeedback: { type: String },
  recommendations: [{ type: String }],

  
  roadmap: [
{
    week: Number,
    title: String,
    tasks: [String]
}
],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
