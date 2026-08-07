import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#05070B] py-8 text-[#6B7280] dark:text-slate-500 text-xs transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-[#111827] dark:text-slate-300">CareerPilot<span className="text-[#3B82F6]">.ai</span></span>
          <span className="text-[#6B7280] dark:text-slate-500">&mdash; Next-Gen Resume & Job Intelligence Platform</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[#4B5563] dark:text-slate-500">
          <span className="flex items-center gap-1.5 hover:text-[#111827] dark:hover:text-slate-400 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Deterministic ATS Engine
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#111827] dark:hover:text-slate-400 transition-colors">
            <Cpu className="w-3.5 h-3.5 text-[#3B82F6]" /> Sentence Transformers
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#111827] dark:hover:text-slate-400 transition-colors">
            <Zap className="w-3.5 h-3.5 text-[#6366F1]" /> Gemini LLM Insights
          </span>
        </div>

      </div>
    </footer>
  );
}
