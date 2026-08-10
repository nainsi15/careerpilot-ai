import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analysisAPI, resumeAPI, jobAPI } from '../services/api';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  History, 
  ShieldCheck,
  Target,
  FileSearch,
  GitCompare
} from 'lucide-react';
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

      // 2. Upload Job Description (Optional)
      let jobId = null;
      if (jdText.trim()) {
        const jobRes = await jobAPI.upload({ title: jdTitle || 'Custom Job Description', rawText: jdText });
        jobId = jobRes.data.jobId;
      }

      // 3. Run Analysis
      const payload = { resumeId };
      if (jobId) payload.jobId = jobId;
      
      const analysisRes = await analysisAPI.run(payload);
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

  const latestAnalysis = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-200">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="space-y-2 z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Analyze your resume against a job description and get clear, actionable improvements.
          </p>
        </div>
      </motion.div>

      {/* Analyze Your Resume Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 sm:p-8 space-y-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-[#3B82F6]" />
          <h2 className="text-lg font-bold text-white">Analyze Your Resume</h2>
        </div>

        <form onSubmit={handleQuickRun} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Resume Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Resume (PDF)</label>
              <div className="border border-dashed border-white/[0.15] bg-white/[0.02] rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] hover:border-white/[0.25] transition-colors h-48 relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload Resume"
                />
                <Upload className="w-8 h-8 text-slate-400 mb-3" />
                {resumeFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{resumeFile.name}</p>
                    <p className="text-xs text-slate-400">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm text-slate-400">
                    <p>Drag & drop your resume here</p>
                    <p className="text-xs text-slate-500">or</p>
                    <span className="inline-block mt-2 px-4 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Job Description */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-semibold text-slate-300">Job Description (Optional)</label>
              <textarea
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full p-4 text-sm resize-none flex-1 min-h-[12rem] bg-white/[0.02] border border-white/[0.1] rounded-xl text-slate-200 focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/50 transition-all placeholder:text-slate-500"
              />
              <div className="text-[10px] text-right text-slate-500">
                {jdText.length} / 5000 characters
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{analysisSteps[currentStep]}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Resume</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Dashboard Metrics (from latest analysis) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* ATS Score */}
        <div className="p-5 space-y-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Overall ATS Score</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestAnalysis?.atsScore ? `${latestAnalysis.atsScore}%` : '—'}
          </p>
          <p className="text-xs text-slate-400">
            {latestAnalysis?.atsScore >= 80 ? 'Competitive' : latestAnalysis?.atsScore >= 50 ? 'Good' : latestAnalysis ? 'Needs Work' : 'No data'}
          </p>
          {latestAnalysis?.atsScore && <div className="h-1 mt-3 rounded-full bg-white/[0.1]"><div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${latestAnalysis.atsScore}%` }} /></div>}
        </div>

        {/* JD Match */}
        <div className="p-5 space-y-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <Target className="w-4 h-4 text-[#22C55E]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Job Description Match</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestAnalysis?.semanticSimilarity ? `${latestAnalysis.semanticSimilarity}%` : '—'}
          </p>
          <p className="text-xs text-slate-400">
            {!latestAnalysis ? 'No data' : !latestAnalysis.jobId ? 'Job description not provided' : latestAnalysis.semanticSimilarity >= 80 ? 'Good Match' : latestAnalysis.semanticSimilarity >= 50 ? 'Fair Match' : 'Low Match'}
          </p>
          {latestAnalysis?.semanticSimilarity && <div className="h-1 mt-3 rounded-full bg-white/[0.1]"><div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${latestAnalysis.semanticSimilarity}%` }} /></div>}
        </div>

        {/* Resume Quality */}
        <div className="p-5 space-y-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Resume Quality</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestAnalysis?.resumeQuality?.Impact_Metrics ? `${latestAnalysis.resumeQuality.Impact_Metrics}%` : '—'}
          </p>
          <p className="text-xs text-slate-400">
            {latestAnalysis?.resumeQuality?.Impact_Metrics >= 80 ? 'Strong' : latestAnalysis ? 'Average' : 'No data'}
          </p>
          {latestAnalysis?.resumeQuality?.Impact_Metrics && <div className="h-1 mt-3 rounded-full bg-white/[0.1]"><div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${latestAnalysis.resumeQuality.Impact_Metrics}%` }} /></div>}
        </div>

        {/* Detected Sections */}
        <div className="p-5 space-y-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Detected Sections</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestAnalysis?.detectedSections ? `${latestAnalysis.detectedSections.length} / 5` : '—'}
          </p>
          <p className="text-xs text-slate-400">
            {latestAnalysis?.detectedSections?.length >= 4 ? 'Complete' : latestAnalysis ? 'Missing Sections' : 'No data'}
          </p>
          {latestAnalysis?.detectedSections && <div className="h-1 mt-3 rounded-full bg-white/[0.1]"><div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${(latestAnalysis.detectedSections.length / 5) * 100}%` }} /></div>}
        </div>
      </motion.div>

      {/* What You Can Do With CareerPilot AI */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-base font-bold text-white px-2">What you can do with CareerPilot AI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-semibold text-white">ATS Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">See how your resume performs against ATS criteria.</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-[#EF4444]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Missing Skills</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Identify important skills missing from your resume.</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Resume Improvements</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Get concise recommendations to improve your resume.</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Compare Versions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Compare different resume versions and track improvements.</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Analyses List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-white">Recent Analyses</h2>
          </div>
          <Link to="/history" className="text-xs text-[#3B82F6] hover:text-[#60A5FA] hover:underline flex items-center gap-1 font-semibold transition-colors">
            <span>View All</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading analyses...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/[0.1] rounded-xl space-y-3">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No analyses run yet. Upload your resume to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-white/[0.08]">
                  <th className="py-3 font-semibold">Resume</th>
                  <th className="py-3 font-semibold">Target Role</th>
                  <th className="py-3 font-semibold">ATS Score</th>
                  <th className="py-3 font-semibold">JD Match</th>
                  <th className="py-3 font-semibold">Analyzed On</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {history.slice(0, 5).map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-200">
                          {item.resumeId?.originalFilename || 'Resume.pdf'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {item.jobId?.title || 'Target Job Role'}
                    </td>
                    <td className="py-3">
                      <span className="text-white font-bold">{item.atsScore}%</span>
                    </td>
                    <td className="py-3">
                      <span className="text-white font-bold">{item.semanticSimilarity || 0}%</span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/analysis/${item._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] text-xs font-semibold text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>View Analysis</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}
