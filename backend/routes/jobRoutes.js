const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');
const JobDescription = require('../models/JobDescription');

function normalizeJDWithPython(jdText) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(__dirname, '../ai_engine/pipeline.py');
    const child = spawn(pythonPath, [scriptPath, 'normalize_jd']);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { errorOutput += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('Python JD normalize error:', errorOutput);
        return reject(new Error('Failed to normalize job description.'));
      }
      try {
        const json = JSON.parse(output);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON response from JD normalizer.'));
      }
    });

    child.stdin.write(JSON.stringify({ jd_text: jdText }));
    child.stdin.end();
  });
}

// POST /job/upload
router.post('/upload', auth, async (req, res) => {
  try {
    const { title, rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }

    const normalizedData = await normalizeJDWithPython(rawText.trim());

    const job = new JobDescription({
      userId: req.user.userId,
      title: title || normalizedData.title || 'Target Job Description',
      rawText: rawText.trim(),
      normalizedData,
      isVague: normalizedData.is_vague || false
    });

    await job.save();

    res.status(201).json({
      message: 'Job description processed and normalized successfully',
      jobId: job._id,
      title: job.title,
      isVague: job.isVague,
      normalizedData: job.normalizedData
    });
  } catch (err) {
    console.error('Job upload error:', err);
    res.status(500).json({ error: err.message || 'Server error processing job description.' });
  }
});

module.exports = router;
