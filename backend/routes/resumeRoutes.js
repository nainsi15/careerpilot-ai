const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.doc') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed.'));
    }
  }
});

// Helper function to call Python parser
function parseResumeWithPython(filePath) {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.join(__dirname, '../ai_engine/pipeline.py');
    const child = spawn(pythonPath, [scriptPath, 'parse_resume', filePath]);

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => { output += data.toString(); });
    child.stderr.on('data', (data) => { errorOutput += data.toString(); });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error('Python parse error:', errorOutput);
        return reject(new Error('Failed to parse resume file.'));
      }
      try {
        const json = JSON.parse(output);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid JSON response from parser.'));
      }
    });
  });
}

// POST /resume/upload
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const filePath = req.file.path;
    const parsedResult = await parseResumeWithPython(filePath);

    // Calculate version number for user
    const existingCount = await Resume.countDocuments({ userId: req.user.userId });
    const version = existingCount + 1;

    const resume = new Resume({
      userId: req.user.userId,
      originalFilename: req.file.originalname,
      rawText: parsedResult.raw_text || '',
      parsedData: parsedResult.parsed || {},
      version
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resumeId: resume._id,
      version: resume.version,
      filename: resume.originalFilename,
      parsedData: resume.parsedData,
      rawText: resume.rawText
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ error: err.message || 'Server error uploading resume.' });
  }
});

module.exports = router;
