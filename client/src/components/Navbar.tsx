import React from 'react';
import { Shield, Lock, Search, FileText, BookOpen, UserCheck, LogOut, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B]/90 backdrop-blur-md border-b border-blue-900/40">
      {/* Emergency Crisis Ribbon */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border-b border-red-500/20 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="font-medium text-red-300">Immediate Safety Emergency?</span>
          <span className="hidden sm:inline text-slate-400">Call Campus Police: <strong className="text-white">(555) 019-9111</strong> or 911</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-400 hidden md:inline">24/7 National Crisis & Suicide Lifeline: <strong className="text-slate-200">Dial 988</strong></span>
          <span className="bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-red-700/50">Confidential</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-400 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                  CampusShield
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SECURE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">Your Identity Protected. Your Campus Safer.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'home'
                  ? 'bg-blue-600/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('resources')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'resources'
                  ? 'bg-blue-600/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Safety Hub</span>
            </button>

            <button
              onClick={() => setCurrentTab('track')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                currentTab === 'track'
                  ? 'bg-blue-600/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Track My Case</span>
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md shadow-blue-500/20 hover:shadow-teal-500/30 hover:brightness-110 transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Report Incident</span>
            </button>
          </nav>

          {/* Right Action / Auth Button */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentTab('staff-dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition ${
                    currentTab === 'staff-dashboard' || currentTab === 'case-workspace' || currentTab === 'admin-console'
                      ? 'bg-blue-600/30 text-teal-300 border-teal-500/40'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-teal-500/20 text-teal-300">
                    {user?.role === 'SYSTEM_ADMIN' ? 'Admin' : 'Officer'}
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  title="Log out of Staff Portal"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('staff-login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60 transition flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
