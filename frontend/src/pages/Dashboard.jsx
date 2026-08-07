import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { analysisAPI, resumeAPI, jobAPI } from '../services/api';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  History, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    "Uploading Resume...",
    "Extracting Resume Text...",
    "Parsing Resume Sections...",
    "Processing Job Description...",
    "Matching Skills...",
    "Computing ATS Score...",
    "Generating AI Insights...",
    "Preparing Report..."
  ];

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
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < analysisSteps.length - 1)
          return prev + 1;
        return prev;
      });
    }, 2500);

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
      clearInterval(interval);
      setCurrentStep(0);
      setUploading(false);
    }
  };

  // Metrics calculation
  const totalAnalyses = history.length;
  const avgAts = totalAnalyses > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.atsScore, 0) / totalAnalyses) : 0;
  const highestMatch = totalAnalyses > 0 ? Math.max(...history.map(h => h.atsScore)) : 0;
  const latestAnalysis = history.length > 0 ? history[0] : null;

  // Chart data
  const chartData = [...history].reverse().map((item, index) => ({
    name: `Run ${index + 1}`,
    ATS: item.atsScore,
    Semantic: item.semanticSimilarity || 0,
  }));

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 linear-card p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {user?.targetRole || 'Software Engineer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-slate-400">
            Track your ATS match score, upload iterations, and close technical skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#172033]/60 text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-white shadow-sm transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/upload-resume"
            className="btn-primary flex items-center gap-2 text-xs font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div whileHover={{ y: -2 }} className="linear-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400">
            <span className="text-xs font-medium">Average ATS Score</span>
            <Award className="w-4 h-4 text-[#4B5563] dark:text-[#3B82F6]" />
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F8FAFC]">{avgAts}%</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400 flex items-center gap-1">
            <span className="text-[#22C55E] font-medium">Across {totalAnalyses} runs</span>
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="linear-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400">
            <span className="text-xs font-medium">Highest Job Match</span>
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F8FAFC]">{highestMatch}%</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Best performing resume</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="linear-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400">
            <span className="text-xs font-medium">Shortlist Status</span>
            <Zap className="w-4 h-4 text-[#6366F1]" />
          </div>
          <p className="text-lg font-bold text-[#111827] dark:text-[#F8FAFC] truncate">
            {latestAnalysis ? latestAnalysis.shortlistReadiness : 'No Data'}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Latest analysis status</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="linear-card p-5 space-y-2">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-slate-400">
            <span className="text-xs font-medium">Total Analyses</span>
            <History className="w-4 h-4 text-[#4B5563] dark:text-[#38BDF8]" />
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F8FAFC]">{totalAnalyses}</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Saved in cloud history</p>
        </motion.div>

      </div>

      {/* Modern Thin Line Chart Section */}
      {chartData.length > 1 && (
        <div className="linear-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">Score Progression</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">ATS match score and semantic similarity over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#3B82F6]"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> ATS Score</span>
              <span className="flex items-center gap-1.5 text-[#22C55E]"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Semantic Vector</span>
            </div>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke={isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB"} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={isDark ? "#94A3B8" : "#4B5563"} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke={isDark ? "#94A3B8" : "#4B5563"} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#111827' : '#FFFFFF', 
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    color: isDark ? '#F8FAFC' : '#111827',
                    boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.08)'
                  }}
                />
                <Line type="monotone" dataKey="ATS" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Semantic" stroke="#22C55E" strokeWidth={2} dot={{ r: 4, fill: '#22C55E' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Grid: Quick Upload Widget & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Upload Widget (1 Col) */}
        <div className="linear-card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">Quick Match Analysis</h2>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Upload PDF & paste job text</p>
            </div>
          </div>

          <form onSubmit={handleQuickRun} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Resume File (PDF/DOCX)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full text-xs text-[#4B5563] dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#3B82F6]/10 file:text-[#3B82F6] hover:file:bg-[#3B82F6]/20 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Target Role / Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
                className="saas-input w-full px-3 py-2 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Job Description Text</label>
              <textarea
                rows={4}
                placeholder="Paste job description or requirements..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="saas-input w-full p-3 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{analysisSteps[currentStep]}</span>
                </div>
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
          
          <div className="linear-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">Recent Resume Analyses</h2>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">Populated from backend database</p>
              </div>
              <Link to="/history" className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1 font-semibold">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[#6B7280] space-y-2">
                <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading analyses...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl space-y-3">
                <FileText className="w-8 h-8 text-[#6B7280] mx-auto" />
                <p className="text-xs text-[#6B7280] dark:text-slate-400">No analyses run yet. Use Quick Match tool to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                {history.slice(0, 5).map((item) => (
                  <div key={item._id} className="py-3.5 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111827] dark:text-slate-200">
                          {item.jobId?.title || 'Target Job Role'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-[#172033] text-[#4B5563] dark:text-slate-400 font-mono font-medium">
                          v{item.resumeId?.version || 1}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-2">
                        <span>{item.resumeId?.originalFilename || 'Resume.pdf'}</span>
                        <span>&bull;</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-bold text-[#3B82F6]">
                          {item.atsScore}% <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-normal">ATS</span>
                        </div>
                        <div className="text-[10px] text-[#22C55E] font-medium">
                          {item.semanticSimilarity}% Semantic
                        </div>
                      </div>

                      <Link
                        to={`/analysis/${item._id}`}
                        className="p-2 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/20 transition-colors"
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
            <div className="linear-card p-6 space-y-3">
              <h3 className="text-sm font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6366F1]" />
                <span>Latest AI Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {latestAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-[#374151] dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
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
