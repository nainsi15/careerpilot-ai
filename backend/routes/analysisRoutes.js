const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const Analysis = require('../models/Analysis');

function runAnalysisWithPython(parsedResume, normalizedJd, rawResume, rawJd) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(__dirname, '../ai_engine/pipeline.py');
    const child = spawn(pythonPath, [scriptPath, 'run_analysis']);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { errorOutput += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('Python analysis error:', errorOutput);
        return reject(new Error('Failed to run AI analysis.'));
      }
      try {
        const json = JSON.parse(output);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON response from analysis engine.'));
      }
    });

    const payload = {
      parsed_resume: parsedResume,
      normalized_jd: normalizedJd,
      raw_resume: rawResume,
      raw_jd: rawJd
    };

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

// POST /analysis/run
router.post('/run', auth, async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;
    if (!resumeId || !jobId) {
      return res.status(400).json({ error: 'Both resumeId and jobId are required.' });
    }

    const resume = await Resume.findById(resumeId);
    const job = await JobDescription.findById(jobId);

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or Job Description not found.' });
    }

    const analysisResult = await runAnalysisWithPython(
      resume.parsedData,
      job.normalizedData,
      resume.rawText,
      job.rawText
    );

    const analysis = new Analysis({
      userId: req.user.userId,
      resumeId: resume._id,
      jobId: job._id,
      
      atsScore: analysisResult.ats_score,
      skillScore: analysisResult.skill_score,
      semanticSimilarity: analysisResult.semantic_similarity,
      sectionScore: analysisResult.section_score,
      impactScore: analysisResult.impact_score,
      
      shortlistReadiness: analysisResult.shortlist_readiness,
      detectedSections: analysisResult.detected_sections,
      strongSkills: analysisResult.strong_skills,
      missingSkills: analysisResult.missing_skills,
      rewrittenBullets: analysisResult.rewritten_bullets,
      recruiterFeedback: analysisResult.recruiter_feedback,
      recommendations: analysisResult.recommendations
    });

    await analysis.save();

    const populated = await Analysis.findById(analysis._id)
      .populate('resumeId', 'originalFilename version')
      .populate('jobId', 'title isVague');

    res.status(201).json({
      message: 'Analysis completed successfully',
      analysis: populated
    });
  } catch (err) {
    console.error('Run analysis error:', err);
    res.status(500).json({ error: err.message || 'Server error running analysis.' });
  }
});

// GET /analysis/history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('resumeId', 'originalFilename version')
      .populate('jobId', 'title isVague');

    res.json({ history });
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ error: 'Server error fetching analysis history.' });
  }
});

// GET /analysis/compare?id1=X&id2=Y
router.get('/compare', auth, async (req, res) => {
  try {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) {
      return res.status(400).json({ error: 'Two analysis IDs (id1 and id2) are required for comparison.' });
    }

    const a1 = await Analysis.findById(id1).populate('resumeId').populate('jobId');
    const a2 = await Analysis.findById(id2).populate('resumeId').populate('jobId');

    if (!a1 || !a2) {
      return res.status(404).json({ error: 'One or both analysis records were not found.' });
    }

    res.json({
      analysis1: a1,
      analysis2: a2,
      atsScoreDelta: (a2.atsScore - a1.atsScore).toFixed(1),
      semanticDelta: (a2.semanticSimilarity - a1.semanticSimilarity).toFixed(1),
      newSkillsAdded: a2.strongSkills.filter(s => !a1.strongSkills.includes(s))
    });
  } catch (err) {
    console.error('Compare analysis error:', err);
    res.status(500).json({ error: 'Server error comparing analyses.' });
  }
});

// GET /analysis/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('resumeId')
      .populate('jobId');

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    res.json({ analysis });
  } catch (err) {
    console.error('Get analysis error:', err);
    res.status(500).json({ error: 'Server error fetching analysis details.' });
  }
});

module.exports = router;
