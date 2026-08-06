import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { GitCompare, ArrowUpRight, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
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
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Comparing Resume Iteration Scores & Skill Vectors...</p>
      </div>
    );
  }

  if (!compareData) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <GitCompare className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Select 2 Versions to Compare</h2>
        <p className="text-xs text-slate-400">Go to History and select checkboxes for two analyses to compare score improvements.</p>
        <Link to="/history" className="inline-block px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold">
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
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Version Delta Analysis
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Resume Iteration Progress</h1>
        <p className="text-xs text-slate-400">Compare score improvement and technical skill evolution over time.</p>
      </div>

      {/* Delta Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">ATS Score Improvement</span>
          <p className={`text-4xl font-extrabold my-1 ${isScoreImproved ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isScoreImproved ? `+${atsScoreDelta}%` : `${atsScoreDelta}%`}
          </p>
          <p className="text-[11px] text-slate-400">Delta between V1 and V2</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Semantic Match Delta</span>
          <p className="text-4xl font-extrabold text-sky-400 my-1">
            {parseFloat(semanticDelta) >= 0 ? `+${semanticDelta}%` : `${semanticDelta}%`}
          </p>
          <p className="text-[11px] text-slate-400">Vector embedding alignment</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">New Skills Added</span>
          <p className="text-4xl font-extrabold text-purple-400 my-1">
            {newSkillsAdded?.length || 0}
          </p>
          <p className="text-[11px] text-slate-400">Detected in updated iteration</p>
        </div>

      </div>

      {/* Side-by-Side Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Version 1 Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">BASELINE ITERATION (V1)</span>
              <h3 className="text-base font-bold text-white">{analysis1.resumeId?.originalFilename || 'Resume_V1.pdf'}</h3>
              <p className="text-[11px] text-slate-400">{new Date(analysis1.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-300">{analysis1.atsScore}%</span>
              <p className="text-[10px] text-slate-500">ATS Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Detailed Scores</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Skill Match Score: <span className="text-white font-semibold">{analysis1.skillScore}%</span></li>
              <li>• Semantic Vector Alignment: <span className="text-white font-semibold">{analysis1.semanticSimilarity}%</span></li>
              <li>• Shortlist Status: <span className="text-white font-semibold">{analysis1.shortlistReadiness}</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Matched Skills ({analysis1.strongSkills?.length || 0})</h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis1.strongSkills?.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Version 2 Card */}
        <div className="glass-card p-6 rounded-2xl border border-sky-500/30 space-y-6 bg-sky-950/10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">UPDATED ITERATION (V2)</span>
              <h3 className="text-base font-bold text-white">{analysis2.resumeId?.originalFilename || 'Resume_V2.pdf'}</h3>
              <p className="text-[11px] text-slate-400">{new Date(analysis2.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400">{analysis2.atsScore}%</span>
              <p className="text-[10px] text-slate-400">ATS Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">Detailed Scores</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Skill Match Score: <span className="text-emerald-400 font-semibold">{analysis2.skillScore}%</span></li>
              <li>• Semantic Vector Alignment: <span className="text-sky-400 font-semibold">{analysis2.semanticSimilarity}%</span></li>
              <li>• Shortlist Status: <span className="text-emerald-400 font-semibold">{analysis2.shortlistReadiness}</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Newly Added Skills ({newSkillsAdded?.length || 0})</h4>
            <div className="flex flex-wrap gap-1.5">
              {newSkillsAdded?.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1">
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
