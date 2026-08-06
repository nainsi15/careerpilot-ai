import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { FileText, Upload, CheckCircle2, ArrowRight, AlertCircle, Sparkles, FileCode, Check } from 'lucide-react';
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
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 bg-sky-500/10 px-3.5 py-1 rounded-full border border-sky-500/20">
          <FileText className="w-3.5 h-3.5" />
          <span>Step 1 of 2: Resume Parser</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Upload Your Resume</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Our PyMuPDF and spaCy NLP pipeline automatically extracts contact details, skills, education, and bullet points into structured JSON.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6 text-center">
        
        <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-2xl p-10 transition-colors bg-slate-900/40 relative">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 mx-auto flex items-center justify-center text-sky-400">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {file ? file.name : 'Drag & Drop PDF or DOCX resume here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</p>
            </div>
            {file && (
              <span className="inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        </div>

        {/* Upload Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
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

      </div>

      {/* Live Parser Pipeline Progress */}
      {parsingStep > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">PyMuPDF & spaCy Parsing Pipeline</h3>
          <div className="space-y-2">
            {[
              { step: 1, text: 'PyMuPDF raw text stream extraction' },
              { step: 2, text: 'spaCy NER & section classification' },
              { step: 3, text: 'Structuring skills, education, experience JSON' },
              { step: 4, text: 'Parsed JSON successfully generated!' }
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 text-xs">
                {parsingStep > s.step ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : parsingStep === s.step ? (
                  <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
                <span className={parsingStep >= s.step ? 'text-slate-200' : 'text-slate-500'}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted JSON Preview Card */}
      {parsedResult && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Parsed Resume Structure</h2>
              <p className="text-xs text-slate-400">Extracted from PyMuPDF & spaCy</p>
            </div>
            <button
              onClick={() => navigate('/upload-jd')}
              className="px-5 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-xs hover:bg-sky-400 transition-colors flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <span>Next: Add Job Description</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Detected Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Detected Technical Skills ({parsedResult.parsedData?.skills?.length || 0})</h4>
            <div className="flex flex-wrap gap-2">
              {parsedResult.parsedData?.skills?.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-medium border border-sky-500/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Raw JSON Accordion */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Structured Data Payload</h4>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-48">
              {JSON.stringify(parsedResult.parsedData, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
