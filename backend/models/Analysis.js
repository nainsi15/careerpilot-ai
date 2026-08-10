const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  
  atsScore: { type: Number, required: true },
  semanticSimilarity: { type: Number }, // Optional, only if JD is present
  technicalSkills: { type: Number, default: 0 },
  resumeStructure: { type: Number, default: 0 },
  experienceRelevance: { type: Number, default: 0 },
  sectionCompleteness: { type: Number, default: 0 },
  
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
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  recommendedImprovements: [
    {
      title: String,
      why_it_matters: String,
      what_to_change: String
    }
  ],
  resumeQuality: {
    content_quality: Number,
    technical_skills: Number,
    projects: Number,
    experience: Number,
    achievements: Number,
    formatting: Number,
    clarity: Number
  },
  techSkillProfile: {
    frontend: { type: [String], default: [] },
    backend: { type: [String], default: [] },
    database: { type: [String], default: [] },
    cloud: { type: [String], default: [] },
    ai_ml: { type: [String], default: [] }
  },  
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
