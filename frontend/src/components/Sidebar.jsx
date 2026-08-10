import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  History, 
  GitCompare, 
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'History', path: '/history', icon: History },
    { label: 'Compare', path: '/compare', icon: GitCompare },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!user) return null;

  return (
    <aside className="w-64 hidden md:flex flex-col h-screen sticky top-0 border-r border-white/[0.08] bg-[#05070B]/40 backdrop-blur-2xl z-40 text-slate-200">
      
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] p-[1px] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#05070B] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            CareerPilot<span className="text-[#3B82F6] ml-0.5">.ai</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-lg shadow-black/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#3B82F6]' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] mb-2 hover:bg-white/[0.05] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-lg">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <Link to="/settings" className="text-[10px] text-[#60A5FA] hover:text-[#93C5FD] hover:underline transition-colors">View Profile</Link>
          </div>
        </div>
        
        <button
          onClick={() => {
            logoutUser();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
