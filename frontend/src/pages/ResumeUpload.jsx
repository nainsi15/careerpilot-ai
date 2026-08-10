import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumeAPI, jobAPI, analysisAPI } from '../services/api';
import { FileText, Upload, CheckCircle2, Sparkles, Target, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const analysisSteps = [
    "Extracting resume content",
    "Checking resume structure",
    "Comparing skills",
    "Calculating ATS score",
    "Generating recommendations"
  ];

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a valid PDF resume.');
      return;
    }

    setLoading(true);
    setParsingStep(0);

    // Simulate UI progress
    const interval = setInterval(() => {
      setParsingStep(prev => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    try {
      // 1. Upload Resume
      const resumeFormData = new FormData();
      resumeFormData.append('resume', file);
      const resumeRes = await resumeAPI.upload(resumeFormData);
      const resumeId = resumeRes.data.resumeId;

      // 2. Upload Job Description (if provided)
      let jobId = null;
      if (jdText.trim()) {
        const jobRes = await jobAPI.upload({ title: 'Target Role', rawText: jdText });
        jobId = jobRes.data.jobId;
      }

      // 3. Run Analysis
      const analysisRes = await analysisAPI.run({ resumeId, jobId });
      toast.success('Analysis completed successfully!');
      navigate(`/analysis/${analysisRes.data.analysis._id}`);
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Something went wrong while analyzing your resume. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setParsingStep(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-slate-200">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col space-y-2 z-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Analyze Your Resume
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Upload your resume and optionally add a job description to see how well your profile matches the role.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10"
      >
        {/* Left Column: Resume Upload */}
        <div className="p-6 sm:p-8 space-y-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-white">Upload Resume</h2>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="border border-dashed border-white/[0.15] bg-white/[0.02] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] hover:border-white/[0.25] transition-colors flex-1 relative min-h-[240px]">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Upload Resume"
                disabled={loading}
              />
              
              {file ? (
                <div className="space-y-4 flex flex-col items-center z-10 relative pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">✓ Resume uploaded</p>
                    <p className="text-xs text-slate-300 font-medium">{file.name}</p>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="mt-2 text-xs text-rose-400 hover:text-rose-300 pointer-events-auto flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] mx-auto flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-sm text-slate-400">
                    <p className="font-medium text-white">Drag & drop your resume here</p>
                    <p className="text-xs text-slate-500">or</p>
                    <span className="inline-block mt-2 px-5 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer pointer-events-auto">
                      Browse Files
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">PDF files only</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Job Description */}
        <div className="p-6 sm:p-8 space-y-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <h2 className="text-lg font-bold text-white">Job Description</h2>
              <p className="text-[11px] text-slate-400">Optional — recommended for targeted ATS matching</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2 relative z-10">
            <textarea
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={loading}
              className="w-full p-4 text-sm resize-none flex-1 min-h-[240px] bg-white/[0.02] border border-white/[0.1] rounded-xl text-slate-200 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all placeholder:text-slate-500 disabled:opacity-50"
            />
            <div className="text-[10px] text-right text-slate-500">
              {jdText.length} / 5000 characters
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analysis Action / Loading State */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2 z-10 relative"
      >
        {loading ? (
          <div className="w-full max-w-md mx-auto p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-white">Analyzing your resume...</span>
            </div>
            
            <div className="space-y-3">
              {analysisSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {parsingStep > idx ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  ) : parsingStep === idx ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/[0.2]" />
                  )}
                  <span className={parsingStep >= idx ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={!file}
            className="w-full max-w-md mx-auto py-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Resume</span>
          </button>
        )}
      </motion.div>

    </div>
  );
}
