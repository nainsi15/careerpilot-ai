const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');


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
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀 CareerPilot AI Backend running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error(err.message);
    process.exit(1);
  }
}

startServer();