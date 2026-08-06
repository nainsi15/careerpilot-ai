import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Key, ShieldCheck, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, loginUser } = useAuth();
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
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-sky-400" />
          <span>Account Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-400">Manage target role and platform configurations</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Primary Target Career Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
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

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold text-xs hover:brightness-110 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
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
        </form>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          <span>AI Engine & Embedding Integration Status</span>
        </h3>
        <ul className="text-xs text-slate-400 space-y-2">
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PyMuPDF & spaCy PDF Parser Engine: <strong className="text-white">Active & Calibrated</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sentence Transformers Vector Embeddings (`all-MiniLM-L6-v2`): <strong className="text-white">Loaded</strong></span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Gemini LLM Provider: <strong className="text-white">Connected with Deterministic NLP Fallback</strong></span>
          </li>
        </ul>
      </div>

    </div>
  );
}
