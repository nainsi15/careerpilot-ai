const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use('/job', jobRoutes);
app.use('/analysis', analysisRoutes);
app.use('/report', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CareerPilot AI Backend', timestamp: new Date() });
});

// MongoDB Connection Handler with MongoMemoryServer Fallback
async function startServer() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerpilot';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to Local MongoDB database');
  } catch (err) {
    console.log('Local MongoDB connection failed. Starting in-memory MongoDB Server...');
    try {
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log('Connected to MongoDB Memory Server successfully!');
    } catch (memErr) {
      console.error('Fatal: Could not connect to any MongoDB instance:', memErr);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`CareerPilot AI Backend listening on port ${PORT}`);
  });
}

startServer();
