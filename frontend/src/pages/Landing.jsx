import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  FileSearch,
  TrendingUp,
  GitCompare
} from 'lucide-react';
import GalaxyBackground from '../components/GalaxyBackground';

export default function Landing() {
  return (
    <GalaxyBackground>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">

        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight text-white leading-[1.1] text-center"
        >
          Optimize your resume.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#93C5FD]">
            Land more interviews.
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed text-center"
        >
          Instantly analyze your resume against any job description.
          Discover missing skills, improve your formatting, and get past
          the ATS filters.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 group text-sm font-semibold rounded-xl px-6 py-3.5 text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            style={{
              background:
                'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
            }}
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center text-sm font-semibold px-6 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white hover:bg-white/[0.1] transition-all backdrop-blur-sm"
          >
            Sign In to Dashboard
          </Link>
        </motion.div>

        {/* What You Can Do */}
        <section className="w-full max-w-6xl mx-auto px-2 sm:px-6 pt-16">
          <div className="space-y-6">

            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
              What you can do with CareerPilot AI
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* ATS Analysis */}
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col gap-2.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  ATS Analysis
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  See how your resume performs against ATS criteria.
                </p>
              </div>

              {/* Missing Skills */}
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col gap-2.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#EF4444]/20 flex items-center justify-center">
                  <FileSearch className="w-4 h-4 text-[#EF4444]" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  Missing Skills
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Identify important skills missing from your resume.
                </p>
              </div>

              {/* Resume Improvements */}
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col gap-2.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  Resume Improvements
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Get concise recommendations to improve your resume.
                </p>
              </div>

              {/* Compare Versions */}
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-col gap-2.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                  <GitCompare className="w-4 h-4 text-[#8B5CF6]" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  Compare Versions
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Compare different resume versions and track improvements.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    </GalaxyBackground>
  );
}