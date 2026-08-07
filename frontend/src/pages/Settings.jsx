import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Briefcase, Key, ShieldCheck, Save, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, loginUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Developer');
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const updated = { ...user, name, targetRole };
      loginUser(updated, localStorage.getItem('cp_token'));
      setSaving(false);
      toast.success('Settings updated successfully!');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
          <User className="w-6 h-6 text-[#3B82F6]" />
          <span>Account Settings & Preferences</span>
        </h1>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">Manage target role and platform configurations</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="linear-card p-6 sm:p-8 space-y-6"
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="saas-input w-full px-4 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="saas-input w-full px-4 py-2.5 text-sm opacity-60 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Primary Target Career Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280] dark:text-slate-500" />
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="saas-input w-full pl-10 pr-4 py-2.5 text-sm"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>
          </div>

          {/* Theme Preference Toggle */}
          <div className="space-y-2 pt-3 border-t border-[#E5E7EB] dark:border-white/[0.06]">
            <label className="text-xs font-semibold text-[#374151] dark:text-slate-300">Appearance Theme</label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-[#3B82F6] bg-[#05070B] text-white shadow-sm'
                    : 'border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/40 text-[#6B7280] dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-[#6366F1]" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Dark Mode</p>
                  <p className="text-[10px] opacity-70">Linear #05070B</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-[#3B82F6] bg-[#F5F7FB] text-[#111827] shadow-sm font-semibold'
                    : 'border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/40 text-[#6B7280] dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Light Mode</p>
                  <p className="text-[10px] opacity-70">Stripe #F5F7FB</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs font-semibold flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="linear-card p-6 space-y-3">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F8FAFC] flex items-center gap-2">
          <Key className="w-4 h-4 text-[#6366F1]" />
          <span>AI Engine & Embedding Integration Status</span>
        </h3>
        <ul className="text-xs text-[#4B5563] dark:text-slate-400 space-y-2">
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>PyMuPDF & spaCy PDF Parser Engine: <strong className="text-[#111827] dark:text-slate-200">Active & Calibrated</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Sentence Transformers Vector Embeddings (`all-MiniLM-L6-v2`): <strong className="text-[#111827] dark:text-slate-200">Loaded</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            <span>Gemini LLM Provider: <strong className="text-[#111827] dark:text-slate-200">Connected with Deterministic NLP Fallback</strong></span>
          </li>
        </ul>
      </div>

    </div>
  );
}
