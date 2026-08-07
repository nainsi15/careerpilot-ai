import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumeAPI } from '../services/api';
import { FileText, Upload, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [parsedResult, setParsedResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume PDF or DOCX file.');
      return;
    }

    setLoading(true);
    setParsingStep(1); // Extracting PyMuPDF

    try {
      const formData = new FormData();
      formData.append('resume', file);

      setTimeout(() => setParsingStep(2), 800); // spaCy parsing
      setTimeout(() => setParsingStep(3), 1500); // Section & Skill extraction

      const res = await resumeAPI.upload(formData);
      setParsedResult(res.data);
      setParsingStep(4); // Done
      toast.success('Resume parsed successfully!');

      // Save resume ID in session storage for match workflow
      sessionStorage.setItem('cp_current_resume_id', res.data.resumeId);
    } catch (err) {
      console.error('Resume upload error:', err);
      toast.error(err.response?.data?.error || 'Failed to upload and parse resume.');
      setParsingStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3.5 py-1 rounded-full border border-[#3B82F6]/20">
          <FileText className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Resume Parser</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">Upload Your Resume</h1>
        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-400 max-w-md mx-auto">
          Our PyMuPDF and spaCy NLP pipeline automatically extracts contact details, skills, education, and bullet points into structured JSON.
        </p>
      </div>

      {/* Upload Dropzone */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-8 space-y-6 text-center"
      >
        
        <div className="border-2 border-dashed border-[#D1D5DB] dark:border-white/10 hover:border-[#3B82F6] rounded-2xl p-10 transition-colors bg-[#F9FAFB] dark:bg-[#0B1220]/40 relative group">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mx-auto flex items-center justify-center text-[#3B82F6] group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827] dark:text-slate-200">
                {file ? file.name : 'Drag & Drop PDF or DOCX resume here'}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">Maximum file size: 10MB</p>
            </div>
            {file && (
              <span className="inline-block text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        </div>

        {/* Upload Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Parse Resume Sections</span>
            </>
          )}
        </button>

      </motion.div>

      {/* Live Parser Pipeline Progress */}
      {parsingStep > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="linear-card p-6 space-y-4"
        >
          <h3 className="text-sm font-bold text-[#111827] dark:text-[#F8FAFC]">PyMuPDF & spaCy Parsing Pipeline</h3>
          <div className="space-y-2.5">
            {[
              { step: 1, text: 'PyMuPDF raw text stream extraction' },
              { step: 2, text: 'spaCy NER & section classification' },
              { step: 3, text: 'Structuring skills, education, experience JSON' },
              { step: 4, text: 'Parsed JSON successfully generated!' }
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 text-xs">
                {parsingStep > s.step ? (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                ) : parsingStep === s.step ? (
                  <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#D1D5DB] dark:border-slate-700" />
                )}
                <span className={parsingStep >= s.step ? 'text-[#111827] dark:text-slate-200 font-semibold' : 'text-[#6B7280] dark:text-slate-500'}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Extracted JSON Preview Card */}
      {parsedResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="linear-card p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">Parsed Resume Structure</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">Extracted from PyMuPDF & spaCy</p>
            </div>
            <button
              onClick={() => navigate('/upload-jd')}
              className="btn-primary text-xs font-semibold flex items-center gap-2"
            >
              <span>Next: Add Job Description</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Detected Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">
              Detected Technical Skills ({parsedResult.parsedData?.skills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsedResult.parsedData?.skills?.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium border border-[#3B82F6]/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Raw JSON Accordion */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Structured Data Payload</h4>
            <pre className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#05070B] border border-[#E5E7EB] dark:border-white/[0.06] text-[11px] text-[#059669] dark:text-[#22C55E] font-mono overflow-x-auto max-h-48">
              {JSON.stringify(parsedResult.parsedData, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}

    </div>
  );
}
