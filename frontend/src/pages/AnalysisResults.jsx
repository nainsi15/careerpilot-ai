import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { analysisAPI } from '../services/api';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Sparkles, Download, CheckCircle2, AlertTriangle, ExternalLink, GitCompare, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function AnalysisResults() {
  const { id } = useParams();
  const { theme } = useTheme();
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

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("cp_token");

      const response = await axios.get(
        `http://localhost:5000/report/${analysis._id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = `CareerPilot_Report_${analysis._id}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download report.");
    }
  };

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#111827] dark:text-slate-200">Executing Explainable AI Analysis Pipeline...</p>
        <p className="text-xs text-[#6B7280] dark:text-slate-500">Calculating Sentence Vector Cosine Similarity & Deterministic ATS Math</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto" />
        <h2 className="text-xl font-bold text-[#111827] dark:text-[#F8FAFC]">Analysis Not Found</h2>
        <Link to="/dashboard" className="btn-primary text-xs font-semibold inline-block">
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
    if (score >= 80) return 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10';
    if (score >= 60) return 'text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10';
    return 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4B5563] dark:text-slate-400 bg-[#F3F4F6] dark:bg-[#172033] px-2.5 py-1 rounded-md border border-[#E5E7EB] dark:border-white/[0.06]">
              Run ID: {analysis._id.slice(-6)}
            </span>
            <span className="text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/20">
              Target: {analysis.jobId?.title || 'Target Job'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">AI Resume Analysis & ATS Report</h1>
          <p className="text-xs text-[#6B7280] dark:text-slate-400">
            Resume: <span className="text-[#111827] dark:text-slate-200 font-semibold">{analysis.resumeId?.originalFilename || 'Resume.pdf'}</span> &bull; 
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/compare"
            className="btn-secondary text-xs font-semibold flex items-center gap-2"
          >
            <GitCompare className="w-4 h-4 text-[#6366F1]" />
            <span>Compare Versions</span>
          </Link>

          <button
            onClick={handleDownload}
            className="btn-primary text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </motion.div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* ATS Score Gauge */}
        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-3 flex flex-col justify-center items-center">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">Overall ATS Score</span>
          <div className="w-24 h-24 my-1">
            <CircularProgressbar
              value={analysis.atsScore}
              text={`${analysis.atsScore}%`}
              styles={buildStyles({
                textColor: isDark ? "#F8FAFC" : "#111827",
                pathColor: "#3B82F6",
                trailColor: isDark ? "rgba(255,255,255,0.06)" : "#E5E7EB",
                textSize: "20px",
              })}
            />
          </div>
          <div className={`text-xs px-3 py-1 rounded-full border font-semibold ${getScoreColor(analysis.atsScore)}`}>
            {analysis.atsScore >= 80 ? 'Optimal ATS Rank' : analysis.atsScore >= 60 ? 'Competitive' : 'Needs Optimization'}
          </div>
        </motion.div>

        {/* Semantic Vector Match */}
        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">Semantic Similarity</span>
          <p className="text-4xl font-bold text-[#3B82F6] my-2">{analysis.semanticSimilarity}%</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Sentence Transformer Cosine Match</p>
        </motion.div>

        {/* Shortlist Readiness */}
        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">Shortlist Readiness</span>
          <p className="text-lg font-bold text-[#22C55E] my-2">{analysis.shortlistReadiness}</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Based on recruiter criteria</p>
        </motion.div>

        {/* Sections Detected */}
        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2 flex flex-col justify-center">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">Detected Sections</span>
          <p className="text-3xl font-bold text-[#6366F1] my-2">{analysis.detectedSections?.length || 0} / 5</p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">spaCy section extractor</p>
        </motion.div>

      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-white/[0.06] pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
              : 'text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-200'
          }`}
        >
          Overview & Breakdown
        </button>
        <button
          onClick={() => setActiveTab('bullets')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'bullets'
              ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
              : 'text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-200'
          }`}
        >
          Rewritten Bullets ({analysis.rewrittenBullets?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('recruiter')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'recruiter'
              ? 'bg-[#3B82F6] text-white shadow-sm font-semibold'
              : 'text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-200'
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
            <div className="linear-card p-6 space-y-4">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                <span>Deterministic ATS Score Breakdown</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"} />
                    <PolarAngleAxis dataKey="subject" stroke={isDark ? "#94A3B8" : "#4B5563"} tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? "#475569" : "#9CA3AF"} />
                    <Radar name="Candidate Score" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Missing Skills with Learning Links */}
            <div className="linear-card p-6 space-y-4">
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                <span>Missing Skills & Learning Paths ({analysis.missingSkills?.length || 0})</span>
              </h3>

              {analysis.missingSkills?.length === 0 ? (
                <div className="py-8 text-center text-[#6B7280] dark:text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto mb-2" />
                  No missing skills detected! Perfect skill match.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {analysis.missingSkills?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#0B1220]/60 border border-[#E5E7EB] dark:border-white/[0.06] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-[#111827] dark:text-slate-100 uppercase">{item.skill}</span>
                        <div className="text-[10px] text-[#D97706] dark:text-[#F59E0B] font-mono">Urgency: {item.importance}</div>
                      </div>
                      <a
                        href={item.learning_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 text-xs font-semibold border border-[#3B82F6]/20 flex items-center gap-1 transition-colors"
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
          <div className="linear-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <span>Matched Strong Skills ({analysis.strongSkills?.length || 0})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.strongSkills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold border border-[#22C55E]/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* AI Senior Engineering Mentor Learning Roadmap */}
          {analysis.roadmap && analysis.roadmap.length > 0 && (
            <div className="linear-card p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#3B82F6]" />
                    <span>Personalized Senior Engineering Roadmap</span>
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5">
                    Tailored career coaching based on recruiter evaluation criteria and missing skill classification
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-[#3B82F6]/20 self-start sm:self-auto">
                  {analysis.roadmap.length} Focused Modules
                </span>
              </div>

              <div className="space-y-6">
                {analysis.roadmap.map((module, index) => {
                  const cat = module.category || 'framework';
                  const categoryBadge = {
                    interview: { label: 'Interview Preparation', color: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20' },
                    tool: { label: 'Dev Tool Practice', color: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' },
                    cloud: { label: 'Cloud Services', color: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20' },
                    framework: { label: 'Framework & Architecture', color: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' }
                  }[cat] || { label: 'Technical Mastery', color: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-2xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-[#0B1220]/60 p-5 sm:p-6 space-y-4 shadow-sm"
                    >
                      {/* Module Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-white/[0.06] pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#6B7280] dark:text-slate-500">
                              MODULE {module.week || index + 1}
                            </span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${categoryBadge.color}`}>
                              {categoryBadge.label}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">
                            {module.title || `Master ${module.skill}`}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          {module.estimated_effort && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#F3F4F6] dark:bg-[#172033] text-[#374151] dark:text-slate-300 font-medium text-[11px] border border-[#E5E7EB] dark:border-white/[0.06]">
                              ⏱️ {module.estimated_effort}
                            </span>
                          )}
                          {module.expected_impact && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/10 text-[#22C55E] font-semibold text-[11px] border border-[#22C55E]/20">
                              📈 {module.expected_impact}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mentor Lens: Why It Matters & Recruiter Evaluation */}
                      {(module.why_it_matters || module.recruiter_evaluation) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {module.why_it_matters && (
                            <div className="p-3.5 rounded-xl bg-white dark:bg-[#05070B] border border-[#E5E7EB] dark:border-white/[0.06] space-y-1">
                              <span className="font-bold text-[#3B82F6] block text-[11px]">🎯 Why This Skill Matters</span>
                              <p className="text-[#374151] dark:text-slate-300 leading-relaxed">{module.why_it_matters}</p>
                            </div>
                          )}
                          {module.recruiter_evaluation && (
                            <div className="p-3.5 rounded-xl bg-white dark:bg-[#05070B] border border-[#E5E7EB] dark:border-white/[0.06] space-y-1">
                              <span className="font-bold text-[#6366F1] block text-[11px]">🔍 Recruiter Screening Lens</span>
                              <p className="text-[#374151] dark:text-slate-300 leading-relaxed">{module.recruiter_evaluation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Core Concepts */}
                      {module.core_concepts && module.core_concepts.length > 0 && (
                        <div className="space-y-1.5">
                          <h5 className="text-xs font-bold text-[#111827] dark:text-slate-200">📚 Core Concepts to Master</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {module.core_concepts.map((concept, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#05070B] border border-[#E5E7EB] dark:border-white/[0.06] text-[#374151] dark:text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0" />
                                <span className="truncate">{concept}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practical Exercises */}
                      {module.practical_exercises && module.practical_exercises.length > 0 && (
                        <div className="space-y-1.5">
                          <h5 className="text-xs font-bold text-[#111827] dark:text-slate-200">🛠️ Practical Exercises (Applied to Existing Work)</h5>
                          <ul className="space-y-1.5 text-xs text-[#374151] dark:text-slate-300">
                            {module.practical_exercises.map((ex, i) => (
                              <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-[#05070B] border border-[#E5E7EB] dark:border-white/[0.06]">
                                <span className="text-[#22C55E] font-bold mt-0.5">✓</span>
                                <span className="leading-relaxed">{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Interview Strategy */}
                      {module.interview_strategy && (
                        <div className="p-3.5 rounded-xl bg-[#EFF6FF] dark:bg-[#3B82F6]/10 border border-[#BFDBFE] dark:border-[#3B82F6]/20 text-xs text-[#1E40AF] dark:text-[#38BDF8] space-y-1">
                          <span className="font-bold block text-[11px]">💡 Target Interview Strategy</span>
                          <p className="leading-relaxed">{module.interview_strategy}</p>
                        </div>
                      )}

                      {/* Fallback tasks list if detailed fields absent */}
                      {(!module.why_it_matters && module.tasks) && (
                        <ul className="space-y-2">
                          {module.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#374151] dark:text-slate-300 text-xs">
                              <span className="text-[#22C55E] mt-0.5">✔</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: REWRITTEN RESUME BULLETS */}
      {activeTab === 'bullets' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F8FAFC]">AI-Rewritten Action Bullets</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">Gemini LLM bullet point transformer replacing passive language with metrics & power action verbs.</p>
          </div>

          <div className="space-y-4">
            {analysis.rewrittenBullets?.map((bullet, idx) => (
              <div key={idx} className="linear-card p-6 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-slate-500">Original Bullet Point #{idx + 1}</span>
                  <p className="text-xs text-[#374151] dark:text-slate-300 bg-[#F9FAFB] dark:bg-[#05070B] p-3 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] line-through decoration-[#EF4444]/60">
                    {bullet.original}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#22C55E] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> ATS Optimized Bullet Point #{idx + 1}
                  </span>
                  <p className="text-xs text-[#111827] dark:text-white font-medium bg-[#ECFDF5] dark:bg-[#22C55E]/10 p-3.5 rounded-xl border border-[#A7F3D0] dark:border-[#22C55E]/20">
                    {bullet.improved}
                  </p>
                </div>

                <p className="text-[11px] text-[#6B7280] dark:text-slate-400 italic">
                  <span className="font-semibold text-[#3B82F6]">Optimization Note:</span> {bullet.impact_factor}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECRUITER FEEDBACK */}
      {activeTab === 'recruiter' && (
        <div className="space-y-6">
          
          <div className="linear-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#6366F1]" />
              <span>Recruiter Assessment</span>
            </h3>
            <p className="text-xs text-[#374151] dark:text-slate-300 leading-relaxed italic bg-[#F9FAFB] dark:bg-[#0B1220]/60 p-4 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06]">
              "{analysis.recruiterFeedback}"
            </p>
          </div>

          <div className="linear-card p-6 space-y-4">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
              <span>Actionable AI Recommendations</span>
            </h3>
            <ul className="space-y-3">
              {analysis.recommendations?.map((rec, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#0B1220]/60 border border-[#E5E7EB] dark:border-white/[0.06] text-xs text-[#374151] dark:text-slate-200 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
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
