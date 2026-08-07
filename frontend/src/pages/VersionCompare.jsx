import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { GitCompare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VersionCompare() {
  const [searchParams] = useSearchParams();
  const id1 = searchParams.get('id1');
  const id2 = searchParams.get('id2');

  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id1 && id2) {
      fetchComparison();
    } else {
      setLoading(false);
    }
  }, [id1, id2]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const res = await analysisAPI.compare(id1, id2);
      setCompareData(res.data);
    } catch (err) {
      console.error('Fetch compare error:', err);
      toast.error('Failed to load version comparison data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#111827] dark:text-slate-200">Comparing Resume Iteration Scores & Skill Vectors...</p>
      </div>
    );
  }

  if (!compareData) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <GitCompare className="w-12 h-12 text-[#6366F1] mx-auto" />
        <h2 className="text-xl font-bold text-[#111827] dark:text-[#F8FAFC]">Select 2 Versions to Compare</h2>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">Go to History and select checkboxes for two analyses to compare score improvements.</p>
        <Link to="/history" className="btn-primary text-xs font-semibold inline-block">
          Select Versions in History
        </Link>
      </div>
    );
  }

  const { analysis1, analysis2, atsScoreDelta, semanticDelta, newSkillsAdded } = compareData;
  const isScoreImproved = parseFloat(atsScoreDelta) >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 sm:p-8 space-y-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6366F1] bg-[#6366F1]/10 px-3 py-1 rounded-full border border-[#6366F1]/20">
            Version Delta Analysis
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">Resume Iteration Progress</h1>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">Compare score improvement and technical skill evolution over time.</p>
      </motion.div>

      {/* Delta Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">ATS Score Improvement</span>
          <p className={`text-4xl font-bold my-1 ${isScoreImproved ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {isScoreImproved ? `+${atsScoreDelta}%` : `${atsScoreDelta}%`}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Delta between V1 and V2</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">Semantic Match Delta</span>
          <p className="text-4xl font-bold text-[#3B82F6] my-1">
            {parseFloat(semanticDelta) >= 0 ? `+${semanticDelta}%` : `${semanticDelta}%`}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Vector embedding alignment</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="linear-card p-6 text-center space-y-2">
          <span className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold uppercase tracking-wider">New Skills Added</span>
          <p className="text-4xl font-bold text-[#6366F1] my-1">
            {newSkillsAdded?.length || 0}
          </p>
          <p className="text-[11px] text-[#6B7280] dark:text-slate-400">Detected in updated iteration</p>
        </motion.div>

      </div>

      {/* Side-by-Side Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Version 1 Card */}
        <div className="linear-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#6B7280] dark:text-slate-500 uppercase">BASELINE ITERATION (V1)</span>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">{analysis1.resumeId?.originalFilename || 'Resume_V1.pdf'}</h3>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">{new Date(analysis1.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#374151] dark:text-slate-300">{analysis1.atsScore}%</span>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-500">ATS Score</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Detailed Scores</h4>
            <ul className="text-xs text-[#4B5563] dark:text-slate-400 space-y-1.5">
              <li>• Skill Match Score: <span className="text-[#111827] dark:text-slate-200 font-bold">{analysis1.skillScore}%</span></li>
              <li>• Semantic Vector Alignment: <span className="text-[#111827] dark:text-slate-200 font-bold">{analysis1.semanticSimilarity}%</span></li>
              <li>• Shortlist Status: <span className="text-[#111827] dark:text-slate-200 font-bold">{analysis1.shortlistReadiness}</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Matched Skills ({analysis1.strongSkills?.length || 0})</h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis1.strongSkills?.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-[#172033] text-[#374151] dark:text-slate-300 text-[11px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Version 2 Card */}
        <div className="linear-card p-6 space-y-6 border-[#3B82F6]/30">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#3B82F6] uppercase">UPDATED ITERATION (V2)</span>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F8FAFC]">{analysis2.resumeId?.originalFilename || 'Resume_V2.pdf'}</h3>
              <p className="text-[11px] text-[#6B7280] dark:text-slate-400">{new Date(analysis2.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#22C55E]">{analysis2.atsScore}%</span>
              <p className="text-[10px] text-[#6B7280] dark:text-slate-400">ATS Score</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Detailed Scores</h4>
            <ul className="text-xs text-[#4B5563] dark:text-slate-400 space-y-1.5">
              <li>• Skill Match Score: <span className="text-[#22C55E] font-bold">{analysis2.skillScore}%</span></li>
              <li>• Semantic Vector Alignment: <span className="text-[#3B82F6] font-bold">{analysis2.semanticSimilarity}%</span></li>
              <li>• Shortlist Status: <span className="text-[#22C55E] font-bold">{analysis2.shortlistReadiness}</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#374151] dark:text-slate-300">Newly Added Skills ({newSkillsAdded?.length || 0})</h4>
            <div className="flex flex-wrap gap-1.5">
              {newSkillsAdded?.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold border border-[#22C55E]/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
