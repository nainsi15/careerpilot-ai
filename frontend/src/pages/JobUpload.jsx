import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jobAPI, analysisAPI } from '../services/api';
import { Briefcase, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function JobUpload() {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [normalizedResult, setNormalizedResult] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedResumeId = sessionStorage.getItem('cp_current_resume_id');
    if (savedResumeId) {
      setResumeId(savedResumeId);
    }
  }, []);

  const handleNormalize = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      toast.error('Please paste or type the job description.');
      return;
    }

    setLoading(true);
    try {
      const res = await jobAPI.upload({ title: title || 'Target Role Description', rawText });
      setNormalizedResult(res.data);
      sessionStorage.setItem('cp_current_job_id', res.data.jobId);
      toast.success('Job Description normalized by AI!');
    } catch (err) {
      console.error('Job normalize error:', err);
      toast.error(err.response?.data?.error || 'Failed to process job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullAnalysis = async () => {
    const activeResumeId = resumeId || sessionStorage.getItem('cp_current_resume_id');
    const activeJobId = normalizedResult?.jobId || sessionStorage.getItem('cp_current_job_id');

    if (!activeResumeId) {
      toast.error('No resume found. Please upload a resume first.');
      navigate('/upload-resume');
      return;
    }
    if (!activeJobId) {
      toast.error('Please process the job description first.');
      return;
    }

    setLoading(true);
    try {
      const res = await analysisAPI.run({ resumeId: activeResumeId, jobId: activeJobId });
      toast.success('Analysis engine finished!');
      navigate(`/analysis/${res.data.analysis._id}`);
    } catch (err) {
      console.error('Analysis run error:', err);
      toast.error(err.response?.data?.error || 'Failed to run analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3.5 py-1 rounded-full border border-[#3B82F6]/20">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Step 2 of 2: Job Normalizer</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">Target Job Description</h1>
        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-400 max-w-md mx-auto">
          Paste any Job Description — even vague or bulletless text. Our Gemini AI model restructures vague job posts into explicit technical requirements.
        </p>
      </div>

      {/* Input Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 sm:p-8 space-y-4"
      >
        <form onSubmit={handleNormalize} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Job Title / Company Name</label>
            <input
              type="text"
              placeholder="e.g. Frontend Engineer at Vercel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="saas-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Job Description Text</label>
            <textarea
              rows={8}
              required
              placeholder="Paste full job description, requirements, or bullet points here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="saas-input w-full p-4 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Normalize Job Requirements with AI</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Normalized Result Card */}
      {normalizedResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="linear-card p-6 sm:p-8 space-y-6"
        >
          
          {normalizedResult.isVague && (
            <div className="p-4 rounded-xl bg-[#FEF3C7] dark:bg-amber-500/10 border border-[#FDE68A] dark:border-amber-500/20 text-[#B45309] dark:text-[#F59E0B] text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Vague Job Description Detected</p>
                <p className="text-[11px] opacity-90">AI has inferred standard role requirements to ensure accurate keyword matching.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">AI Normalized Requirements</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">Structured requirements ready for embedding match</p>
            </div>
            <button
              onClick={handleRunFullAnalysis}
              disabled={loading}
              className="btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run End-to-End Analysis</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5 p-4 rounded-xl bg-[#F9FAFB] dark:bg-[#0B1220]/60 border border-[#E5E7EB] dark:border-white/[0.06]">
              <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {normalizedResult.normalizedData?.required_skills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium border border-[#3B82F6]/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl bg-[#F9FAFB] dark:bg-[#0B1220]/60 border border-[#E5E7EB] dark:border-white/[0.06]">
              <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Responsibilities</h4>
              <ul className="text-xs text-[#4B5563] dark:text-slate-400 space-y-1 list-disc list-inside">
                {normalizedResult.normalizedData?.responsibilities?.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
