import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Target, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  BookOpen, 
  Layers
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="space-y-24 py-12 md:py-20">
      
      {/* Hero Section */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto px-4 pt-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Resume & ATS Pipeline</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] leading-[1.15]"
        >
          Engineered for engineering careers.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#6366F1]">
            Powered by explainable AI.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-[#374151] dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          CareerPilot AI decomposes your technical resume against target job descriptions using dense Sentence-Transformers embeddings, deterministic ATS scoring, and Gemini LLM optimizations.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Link
            to="/register"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-sm"
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary w-full sm:w-auto flex items-center justify-center text-sm"
          >
            Sign In to Dashboard
          </Link>
        </motion.div>

        {/* Floating Metrics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left"
        >
          <div className="linear-card p-5">
            <p className="text-xs text-[#6B7280] dark:text-slate-500 font-medium">ATS Engine</p>
            <p className="text-lg font-bold text-[#111827] dark:text-slate-100 mt-1">Deterministic</p>
            <p className="text-[11px] text-[#4B5563] dark:text-slate-400 mt-0.5">Zero hallucination math</p>
          </div>
          <div className="linear-card p-5">
            <p className="text-xs text-[#6B7280] dark:text-slate-500 font-medium">Embedding Vector</p>
            <p className="text-lg font-bold text-[#3B82F6] mt-1">384-Dim Dense</p>
            <p className="text-[11px] text-[#4B5563] dark:text-slate-400 mt-0.5">Sentence-Transformers</p>
          </div>
          <div className="linear-card p-5">
            <p className="text-xs text-[#6B7280] dark:text-slate-500 font-medium">JD Normalizer</p>
            <p className="text-lg font-bold text-[#6366F1] mt-1">Structured Schema</p>
            <p className="text-[11px] text-[#4B5563] dark:text-slate-400 mt-0.5">Deconstruct vague roles</p>
          </div>
          <div className="linear-card p-5">
            <p className="text-xs text-[#6B7280] dark:text-slate-500 font-medium">Bullet Optimizer</p>
            <p className="text-lg font-bold text-[#22C55E] mt-1">Impact Verbs</p>
            <p className="text-[11px] text-[#4B5563] dark:text-slate-400 mt-0.5">Quantified bullet points</p>
          </div>
        </motion.div>
      </section>

      {/* 7-Step Explainable Pipeline */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] dark:text-slate-100">
            The Explainable 7-Step Architecture
          </h2>
          <p className="text-[#6B7280] dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            No vague AI scores. CareerPilot breaks down every aspect of your resume matching pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'PDF Extract', desc: 'PyMuPDF text extraction', icon: FileText, color: 'text-[#3B82F6]' },
            { step: '02', title: 'spaCy Parser', desc: 'Section & skill NER', icon: Cpu, color: 'text-[#6366F1]' },
            { step: '03', title: 'JD Normalizer', desc: 'Structure vague descriptions', icon: Layers, color: 'text-[#3B82F6]' },
            { step: '04', title: 'Keywords', desc: 'Hard skill overlap match', icon: Target, color: 'text-[#22C55E]' },
            { step: '05', title: 'Embeddings', desc: 'Sentence vector similarity', icon: TrendingUp, color: 'text-[#F59E0B]' },
            { step: '06', title: 'ATS Score', desc: 'Deterministic calculation', icon: BarChart3, color: 'text-[#3B82F6]' },
            { step: '07', title: 'AI Insights', desc: 'Recruiter feedback & tips', icon: Sparkles, color: 'text-[#6366F1]' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="linear-card p-4 text-center relative flex flex-col items-center justify-between"
            >
              <span className="text-[10px] font-mono font-semibold tracking-wider text-[#6B7280] dark:text-slate-500 mb-2">STEP {item.step}</span>
              <div className="p-2 rounded-xl bg-[#F3F4F6] dark:bg-white/[0.03] border border-[#E5E7EB] dark:border-white/[0.06] mb-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#111827] dark:text-slate-200">{item.title}</h3>
                <p className="text-[11px] text-[#4B5563] dark:text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] dark:text-slate-100">
            Designed for technical candidates
          </h2>
          <p className="text-[#6B7280] dark:text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Everything required to optimize your application, land tech interviews, and track progress over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="linear-card p-7 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-slate-100">Shortlist Readiness Score</h3>
            <p className="text-xs text-[#4B5563] dark:text-slate-400 leading-relaxed">
              Instantly know if your resume qualifies as High, Moderate, or Low readiness for tech recruiter shortlists.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="linear-card p-7 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-slate-100">Missing Skill Learning Links</h3>
            <p className="text-xs text-[#4B5563] dark:text-slate-400 leading-relaxed">
              Detect missing tech stack requirements and access direct documentation and learning links to bridge technical gaps.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="linear-card p-7 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-slate-100">Side-by-Side Version Comparison</h3>
            <p className="text-xs text-[#4B5563] dark:text-slate-400 leading-relaxed">
              Track resume iterations, measure score deltas, and visually compare keywords across revised versions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="linear-card p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111827] dark:text-slate-100">
            Ready to optimize your tech resume?
          </h2>
          <p className="text-[#374151] dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Upload your resume and target job description now to receive a complete explainable ATS analysis and AI-optimized bullet points.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 text-sm font-semibold"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
