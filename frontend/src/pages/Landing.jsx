import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import GalaxyBackground from '../components/GalaxyBackground';

export default function Landing() {
  return (
    <GalaxyBackground className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-8 max-w-4xl mx-auto px-4 w-full pt-12 md:pt-0">
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.15]"
        >
          Optimize your resume.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#93C5FD]">
            Land more interviews.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Instantly analyze your resume against any job description. Discover missing skills, improve your formatting, and get past the ATS filters.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 group text-sm font-semibold rounded-xl px-6 py-3.5 text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}
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

      </div>
    </GalaxyBackground>
  );
}
