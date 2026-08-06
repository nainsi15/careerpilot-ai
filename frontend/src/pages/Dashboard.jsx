import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisAPI, resumeAPI, jobAPI } from '../services/api';
import { Sparkles, Upload, FileText, Briefcase, Award, TrendingUp, ArrowUpRight, History, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.getHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickRun = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please select a resume file (PDF or DOCX)');
      return;
    }
    if (!jdText.trim()) {
      toast.error('Please paste or enter a job description');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload Resume
      const resumeFormData = new FormData();
      resumeFormData.append('resume', resumeFile);
      const resumeRes = await resumeAPI.upload(resumeFormData);
      const resumeId = resumeRes.data.resumeId;

      // 2. Upload Job Description
      const jobRes = await jobAPI.upload({ title: jdTitle || 'Quick Analysis Job', rawText: jdText });
      const jobId = jobRes.data.jobId;

      // 3. Run Analysis
      const analysisRes = await analysisAPI.run({ resumeId, jobId });
      toast.success('AI Analysis Completed Successfully!');
      navigate(`/analysis/${analysisRes.data.analysis._id}`);
    } catch (err) {
      console.error('Quick run error:', err);
      toast.error(err.response?.data?.error || 'Failed to complete quick analysis');
    } finally {
      setUploading(false);
    }
  };

  // Metrics calculation
  const totalAnalyses = history.length;
  const avgAts = totalAnalyses > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.atsScore, 0) / totalAnalyses) : 0;
  const highestMatch = totalAnalyses > 0 ? Math.max(...history.map(h => h.atsScore)) : 0;
  const latestAnalysis = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {user?.targetRole || 'Software Engineer'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-slate-400">Track your ATS match score, upload iterations, and close technical skill gaps.</p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/upload-resume"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Average ATS Score</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{avgAts}%</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Across {totalAnalyses} runs</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Highest Job Match</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{highestMatch}%</p>
          <p className="text-[11px] text-slate-400">Best performing resume</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Shortlist Status</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-lg font-bold text-white truncate">
            {latestAnalysis ? latestAnalysis.shortlistReadiness : 'No Data'}
          </p>
          <p className="text-[11px] text-slate-400">Latest analysis status</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Analyses</span>
            <History className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalAnalyses}</p>
          <p className="text-[11px] text-slate-400">Saved in cloud history</p>
        </div>

      </div>

      {/* Main Grid: Quick Upload Widget & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Upload Widget (1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quick Match Analysis</h2>
              <p className="text-[11px] text-slate-400">Upload PDF & paste job text</p>
            </div>
          </div>

          <form onSubmit={handleQuickRun} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Resume File (PDF/DOCX)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Role / Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Job Description Text</label>
              <textarea
                rows={4}
                placeholder="Paste the job description or requirements here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Match Engine</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Analyses List (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Recent Resume Analyses</h2>
                <p className="text-xs text-slate-400">Populated from backend database</p>
              </div>
              <Link to="/history" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading analyses...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No analyses run yet. Use the Quick Match tool to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {history.slice(0, 5).map((item) => (
                  <div key={item._id} className="py-3.5 flex items-center justify-between hover:bg-slate-900/40 px-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {item.jobId?.title || 'Target Job Role'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          v{item.resumeId?.version || 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{item.resumeId?.originalFilename || 'Resume.pdf'}</span>
                        <span>&bull;</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-sky-400">
                          {item.atsScore}% <span className="text-[10px] text-slate-400 font-normal">ATS</span>
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          {item.semanticSimilarity}% Semantic
                        </div>
                      </div>

                      <Link
                        to={`/analysis/${item._id}`}
                        className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Recommendations Teaser */}
          {latestAnalysis && latestAnalysis.recommendations && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Latest AI Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {latestAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
