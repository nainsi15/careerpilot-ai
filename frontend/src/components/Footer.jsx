import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">CareerPilot AI</span>
          <span>&mdash; Explainable AI Resume & Job Matching Platform</span>
        </div>

        <div className="flex items-center gap-6 text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Deterministic ATS Engine</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-sky-400" /> spaCy & Sentence Transformers</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-400" /> Gemini LLM Insights</span>
        </div>

      </div>
    </footer>
  );
}
