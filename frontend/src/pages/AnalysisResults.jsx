import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisAPI, reportAPI } from '../services/api';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Sparkles, Download, CheckCircle2, AlertTriangle, ExternalLink, ArrowRight, GitCompare, RefreshCw, FileText, Award, ShieldCheck, Zap, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalysisResults() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, bullets, recruiter

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.getById(id);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error('Fetch analysis error:', err);
      toast.error('Failed to load analysis results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Executing Explainable AI Analysis Pipeline...</p>
        <p className="text-xs text-slate-500">Calculating Sentence Vector Cosine Similarity & Deterministic ATS Math</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Analysis Not Found</h2>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: 'Skill Overlap', value: analysis.skillScore || 0, fullMark: 100 },
    { subject: 'Semantic Vector', value: analysis.semanticSimilarity || 0, fullMark: 100 },
    { subject: 'Section Count', value: analysis.sectionScore || 0, fullMark: 100 },
    { subject: 'Action Impact', value: analysis.impactScore || 0, fullMark: 100 },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              Run ID: {analysis._id.slice(-6)}
            </span>
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Target: {analysis.jobId?.title || 'Target Job'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Resume Analysis & ATS Report</h1>
          <p className="text-xs text-slate-400">
            Resume: <span className="text-slate-200 font-medium">{analysis.resumeId?.originalFilename || 'Resume.pdf'}</span> &bull; 
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/compare"
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 text-xs font-semibold hover:text-white transition-colors flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4 text-purple-400" />
            <span>Compare Versions</span>
          </Link>

          <a
            href={reportAPI.getDownloadUrl(analysis._id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-xs hover:brightness-110 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </a>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* ATS Score Gauge */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Overall ATS Score</span>
          <div className="relative inline-flex items-center justify-center my-2">
            <span className="text-4xl font-extrabold text-white">{analysis.atsScore}%</span>
          </div>
          <div className={`text-xs px-3 py-1 rounded-full border mx-auto font-semibold ${getScoreColor(analysis.atsScore)}`}>
            {analysis.atsScore >= 80 ? 'Optimal ATS Rank' : analysis.atsScore >= 60 ? 'Competitive' : 'Needs Optimization'}
          </div>
        </div>

        {/* Semantic Vector Match */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Semantic Similarity</span>
          <p className="text-4xl font-extrabold text-sky-400 my-2">{analysis.semanticSimilarity}%</p>
          <p className="text-[11px] text-slate-400">Sentence Transformer Cosine Match</p>
        </div>

        {/* Shortlist Readiness */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Shortlist Readiness</span>
          <p className="text-base font-bold text-emerald-400 my-2">{analysis.shortlistReadiness}</p>
          <p className="text-[11px] text-slate-400">Based on recruiter criteria</p>
        </div>

        {/* Sections Detected */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Detected Sections</span>
          <p className="text-3xl font-extrabold text-purple-400 my-2">{analysis.detectedSections?.length || 0} / 5</p>
          <p className="text-[11px] text-slate-400">spaCy section extractor</p>
        </div>

      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Breakdown
        </button>
        <button
          onClick={() => setActiveTab('bullets')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'bullets' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Rewritten Resume Bullets ({analysis.rewrittenBullets?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('recruiter')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'recruiter' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Recruiter Feedback & Tips
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Radar Breakdown Chart */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>Deterministic ATS Score Breakdown</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#23314E" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Candidate Score" dataKey="value" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Missing Skills with Learning Links */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Missing Skills & Learning Paths ({analysis.missingSkills?.length || 0})</span>
              </h3>

              {analysis.missingSkills?.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No missing skills detected! Perfect skill match.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {analysis.missingSkills?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-white uppercase">{item.skill}</span>
                        <div className="text-[10px] text-amber-400 font-mono">Urgency: {item.importance}</div>
                      </div>
                      <a
                        href={item.learning_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-medium border border-sky-500/20 flex items-center gap-1 transition-colors"
                      >
                        <span>Learn Skill</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Strong Skills Badge Grid */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Matched Strong Skills ({analysis.strongSkills?.length || 0})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.strongSkills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REWRITTEN RESUME BULLETS */}
      {activeTab === 'bullets' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">AI-Rewritten Action Bullets</h2>
            <p className="text-xs text-slate-400">Gemini LLM bullet point transformer replacing passive language with metrics & power action verbs.</p>
          </div>

          <div className="space-y-4">
            {analysis.rewrittenBullets?.map((bullet, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Original Bullet Point #{idx + 1}</span>
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 line-through decoration-rose-500/60">
                    {bullet.original}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> ATS Optimized Bullet Point #{idx + 1}
                  </span>
                  <p className="text-xs text-white font-medium bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30">
                    {bullet.improved}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  <span className="font-semibold text-sky-400">Optimization Note:</span> {bullet.impact_factor}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECRUITER FEEDBACK */}
      {activeTab === 'recruiter' && (
        <div className="space-y-6">
          
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span>Recruiter Assessment</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              "{analysis.recruiterFeedback}"
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
              <span>Actionable AI Recommendations</span>
            </h3>
            <ul className="space-y-3">
              {analysis.recommendations?.map((rec, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
