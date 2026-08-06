import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Target, FileText, CheckCircle2, TrendingUp, BarChart3, BookOpen, Layers } from 'lucide-react';

export default function Landing() {
  return (
    <div className="space-y-24 py-12">
      
      {/* Hero Section */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto px-4 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Master Production AI Resume Matcher & ATS Pipeline</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans leading-tight">
          Supercharge Your Student Resume with <span className="gradient-text">Explainable AI</span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          CareerPilot AI isn't a text-wrapper. It runs an end-to-end explainable analysis pipeline: PDF extraction &rarr; spaCy section parsing &rarr; Sentence-Transformers dense embedding vectors &rarr; Deterministic ATS scoring &rarr; Gemini LLM feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 bg-[#131B2E]/80 text-slate-200 font-semibold text-sm hover:border-slate-700 transition-all flex items-center justify-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Floating Metrics Pill */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">ATS Engine</p>
            <p className="text-xl font-bold text-white mt-1">Deterministic</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Embedding Vector</p>
            <p className="text-xl font-bold text-sky-400 mt-1">384-Dim Dense</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">JD Normalizer</p>
            <p className="text-xl font-bold text-indigo-400 mt-1">AI Structured</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Bullet Optimizer</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">Impact Verbs</p>
          </div>
        </div>
      </section>

      {/* Explainable Pipeline Diagram */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-white">The Explainable 7-Step Pipeline</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            No black box text comparisons. CareerPilot decomposes your resume and job descriptions with mathematical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[
            { step: '01', title: 'PDF Extract', desc: 'PyMuPDF raw text', icon: FileText, color: 'text-sky-400' },
            { step: '02', title: 'spaCy Parser', desc: 'Section & skill NER', icon: Cpu, color: 'text-indigo-400' },
            { step: '03', title: 'JD Normalizer', desc: 'Structure vague JDs', icon: Layers, color: 'text-purple-400' },
            { step: '04', title: 'Keywords', desc: 'Hard skill overlap', icon: Target, color: 'text-pink-400' },
            { step: '05', title: 'Embeddings', desc: 'Sentence vectors', icon: TrendingUp, color: 'text-emerald-400' },
            { step: '06', title: 'ATS Score', desc: 'Deterministic math', icon: BarChart3, color: 'text-amber-400' },
            { step: '07', title: 'AI Insights', desc: 'Recruiter feedback', icon: Sparkles, color: 'text-sky-400' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl border border-slate-800 text-center relative flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 mb-2">STEP {item.step}</span>
              <item.icon className={`w-6 h-6 mb-2 ${item.color}`} />
              <h3 className="text-xs font-bold text-white">{item.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Built Specially for Tech Students & Graduates</h2>
          <p className="text-slate-400 text-sm">Everything you need to bypass ATS filters and land tech interviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Shortlist Readiness Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get an instant assessment of whether your resume is High, Moderate, or Low readiness for interview shortlisting.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Missing Skill Learning Links</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identify key technical gaps and get direct links to Coursera, MDN, and tutorial paths to close the gap fast.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Version Comparison</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare updated resume iterations side-by-side to track ATS score improvements and newly added technical skills over time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="gradient-border">
          <div className="p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl font-extrabold text-white">Ready to Optimize Your Tech Resume?</h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Upload your resume and target job description now to receive a complete explainable ATS analysis and AI-optimized bullet points.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 hover:brightness-110 transition-all"
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
