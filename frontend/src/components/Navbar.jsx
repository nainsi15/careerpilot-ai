import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  History, 
  GitCompare, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'History', path: '/history', icon: History },
    { label: 'Compare', path: '/compare', icon: GitCompare },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-white/[0.06] bg-white/90 dark:bg-[#05070B]/90 backdrop-blur-xl shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Section: Brand Logo (Only for Unauthenticated) */}
          <div className="flex items-center gap-8">
            {!user && (
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] p-[1px] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full bg-white dark:bg-[#05070B] rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                </div>
                <span className="text-base font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC]">
                  CareerPilot<span className="text-[#3B82F6] ml-0.5">.ai</span>
                </span>
              </Link>
            )}
          </div>

          {/* Right Section: Top Bar Controls (Search, Theme, Notification, Profile) */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                {/* Search Bar Trigger */}
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#4B5563] dark:text-slate-400 bg-white dark:bg-[#0B1220]/80 border border-[#E5E7EB] dark:border-white/[0.06] rounded-xl hover:border-[#D1D5DB] dark:hover:border-white/20 shadow-sm transition-all"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5 text-[#6B7280] dark:text-slate-400" />
                  <span className="hidden sm:inline font-medium">Search...</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280] dark:text-slate-400 bg-[#F3F4F6] dark:bg-white/5 rounded border border-[#E5E7EB] dark:border-white/10">⌘K</kbd>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/80 shadow-sm transition-all hover:bg-[#F9FAFB] dark:hover:bg-white/[0.04]"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3B82F6]" />}
                </button>

                {/* Notification Icon */}
                <button
                  className="relative p-2 text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/80 shadow-sm transition-all hover:bg-[#F9FAFB] dark:hover:bg-white/[0.04]"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-[#4B5563] dark:text-slate-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B82F6] ring-2 ring-white dark:ring-[#05070B]" />
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/80 shadow-sm hover:border-[#D1D5DB] dark:hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-[#111827] dark:text-slate-200">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] dark:text-slate-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-[#E5E7EB] dark:border-white/[0.06]">
                        <p className="text-xs font-bold text-[#111827] dark:text-slate-200">{user.name}</p>
                        <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-[#374151] dark:text-slate-300 hover:bg-[#F3F4F6] dark:hover:bg-white/[0.05] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#3B82F6]" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logoutUser();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Theme Toggle for Unauthenticated Users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-[#4B5563] dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-100 rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0B1220]/80 shadow-sm transition-all hover:bg-[#F9FAFB] dark:hover:bg-white/[0.04]"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3B82F6]" />}
                </button>
                
                <Link 
                  to="/login" 
                  className="text-xs font-semibold text-[#374151] dark:text-slate-300 hover:text-[#111827] dark:hover:text-white px-3.5 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Quick Search Modal (Command Palette Style) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] dark:border-white/[0.06] pb-3">
              <Search className="w-4 h-4 text-[#3B82F6]" />
              <input
                type="text"
                placeholder="Search analyses, resumes, job matches..."
                className="w-full bg-transparent text-sm text-[#111827] dark:text-slate-100 placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-2 py-1 text-[11px] text-[#6B7280] dark:text-slate-400 bg-[#F3F4F6] dark:bg-white/5 rounded-lg border border-[#E5E7EB] dark:border-white/10"
              >
                ESC
              </button>
            </div>
            <div className="py-4 text-center text-xs text-[#6B7280] dark:text-slate-500">
              Type to search across your resume history and analysis reports
            </div>
          </div>
        </div>
      )}
    </>
  );
}
