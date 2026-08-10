import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Sparkles, Download, CheckCircle2, Award, AlertTriangle, ExternalLink, GitCompare, ShieldCheck, Zap, FileText, Target } from 'lucide-react';
import { toast } from 'sonner';
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function AnalysisResults() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-white">Analyzing your resume...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto" />
        <h2 className="text-xl font-bold text-white">Analysis Not Found</h2>
        <Link to="/dashboard" className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-xs font-semibold inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: 'Keyword Match', value: analysis.semanticSimilarity || 0, fullMark: 100 },
    { subject: 'Technical Skills', value: analysis.technicalSkills || 0, fullMark: 100 },
    { subject: 'Resume Structure', value: analysis.resumeStructure || 0, fullMark: 100 },
    { subject: 'Experience Relevance', value: analysis.experienceRelevance || 0, fullMark: 100 },
    { subject: 'Section Completeness', value: analysis.sectionCompleteness || 0, fullMark: 100 },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10'; // Green
    if (score >= 60) return 'text-[#EAB308] border-[#EAB308]/30 bg-[#EAB308]/10'; // Yellow
    return 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10'; // Red
  };

  const getScoreColorText = (score) => {
    if (score >= 80) return 'text-[#22C55E]';
    if (score >= 60) return 'text-[#EAB308]';
    return 'text-[#EF4444]';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-200">

      {/* 1. Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Resume Analysis & ATS Report</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
              Resume: <span className="text-white font-medium">{analysis.resumeId?.originalFilename || 'Resume.pdf'}</span>
            </div>
            <div className="hidden sm:block text-slate-600">•</div>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Target Role: <span className="text-white font-medium">{analysis.jobId?.title || 'Not provided'}</span>
            </div>
            <div className="hidden sm:block text-slate-600">•</div>
            <div>
              Analyzed: <span className="text-white font-medium">{new Date(analysis.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/compare"
            className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-xs font-semibold flex items-center gap-2 text-white transition-colors"
          >
            <GitCompare className="w-4 h-4 text-[#8B5CF6]" />
            <span>Compare Versions</span>
          </Link>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Top Score Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* ATS Score Gauge */}
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl text-center flex flex-col justify-between items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall ATS Score</span>
          {analysis.atsScore !== undefined && analysis.atsScore !== null ? (
            <>
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={analysis.atsScore}
                  text={`${analysis.atsScore}%`}
                  styles={buildStyles({
                    textColor: "#fff",
                    pathColor: "#3B82F6",
                    trailColor: "rgba(255,255,255,0.06)",
                    textSize: "24px",
                  })}
                />
              </div>
              <div className={`text-xs px-3 py-1 rounded-full border font-semibold ${getScoreColor(analysis.atsScore)}`}>
                {analysis.atsScore >= 80 ? 'Strong' : analysis.atsScore >= 60 ? 'Needs Improvement' : 'Low'}
              </div>
            </>
          ) : (
            <p className="text-xl font-bold text-white my-4">—</p>
          )}
        </div>

        {/* Semantic Vector Match */}
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl text-center flex flex-col justify-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Job Description Match</span>
          {analysis.jobId ? (
            <>
              <p className={`text-4xl font-bold my-1 ${getScoreColorText(analysis.semanticSimilarity || 0)}`}>{analysis.semanticSimilarity ?? '—'}%</p>
              <p className="text-xs text-slate-400">
                {(analysis.semanticSimilarity || 0) >= 80 ? 'Strong Match' : (analysis.semanticSimilarity || 0) >= 60 ? 'Moderate Match' : 'Low Match'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-slate-500 my-1">N/A</p>
              <p className="text-xs text-slate-400">Add a job description for targeted matching</p>
            </>
          )}
        </div>

        {/* Sections Detected -> Resume Sections */}
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl flex flex-col justify-center items-center text-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Resume Sections</span>
          <div className="flex flex-col gap-2 items-start mt-2">
            {analysis.detectedSections && analysis.detectedSections.length > 0 ? (
              analysis.detectedSections.map(sec => (
                <div key={sec} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> {sec}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No core sections detected.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 3. Strengths & Areas to Improve */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Strengths */}
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <span>Strengths</span>
          </h3>
          <div className="space-y-3">
            {analysis.strengths && analysis.strengths.length > 0 ? (
              <ul className="space-y-3">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-[#22C55E] mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No strengths data available.</p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            <span>Areas to Improve</span>
          </h3>
          <div className="space-y-3">
            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
              <ul className="space-y-3">
                {analysis.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-[#EF4444] mt-0.5">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No improvement areas found.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 5. Missing Skills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          <span>Missing Skills</span>
        </h3>

        {(!analysis.missingSkills || analysis.missingSkills.length === 0) ? (
          <div className="py-4 text-[#22C55E] text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Great — no significant missing skills detected.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {analysis.missingSkills.map((item, idx) => (
              item.learning_link ? (
                <a
                  key={idx}
                  href={item.learning_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50 transition-colors flex flex-col gap-1 group"
                  title="Click to learn"
                >
                  <span className="text-sm font-bold">{item.skill || item}</span>
                  {item.importance && <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Importance: {item.importance}</span>}
                </a>
              ) : (
                <div key={idx} className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white flex flex-col gap-1">
                  <span className="text-sm font-bold">{item.skill || item}</span>
                  {item.importance && <span className="text-[10px] text-slate-400">Importance: {item.importance}</span>}
                </div>
              )
            ))}
          </div>
        )}
      </motion.div>



      {/* 5. Technical Skill Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-6"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          <span>Technical Skills</span>
        </h3>
        {analysis.techSkillProfile && Object.keys(analysis.techSkillProfile).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analysis.techSkillProfile).map(([key, skills]) => (
              skills && skills.length > 0 ? (
                <div key={key} className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {key.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-slate-200">
                    {skills.join(", ")}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No technical profile data available.</p>
        )}
      </motion.div>

      {/* 7. Recommended Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-xl space-y-4"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
          <span>Recommended Improvements</span>
        </h3>

        {/* Reads both camelCase and snake_case since it's unclear whether
            the Node layer between Python and this component renames keys —
            this was likely the actual cause of "No specific improvements
            recommended" always showing, on top of the backend having no
            fallback data at all (also fixed). */}
        {(() => {
          const improvements = analysis.recommendedImprovements || analysis.recommended_improvements || [];
          return improvements.length > 0 ? (
            <ul className="space-y-4 mt-4">
              {improvements.map((item, i) => (
                <li key={i} className="text-sm text-slate-300 flex flex-col gap-2 bg-white/[0.02] p-5 rounded-xl border border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6] shrink-0" />
                    <span className="font-bold text-white text-base">{item.title}</span>
                  </div>
                  <div className="ml-6 space-y-2">
                    <p className="text-slate-400"><span className="text-slate-300 font-semibold">Why it matters:</span> {item.why_it_matters}</p>
                    <p className="text-slate-300"><span className="text-[#3B82F6] font-semibold">What to change:</span> {item.what_to_change}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No specific improvements recommended.</p>
          );
        })()}
      </motion.div>



    </div>
  );
}
