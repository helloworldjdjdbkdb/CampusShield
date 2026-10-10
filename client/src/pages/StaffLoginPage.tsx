import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, Loader2, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffLoginPageProps {
  onLoginSuccess: () => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Staff Authentication Gateway</h1>
        <p className="text-xs text-slate-400">
          Authorized Campus Safety Officers and Title IX Administrators Only
        </p>
      </div>

      <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Quick Demo Login Credentials */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
          <span className="text-[11px] font-semibold text-teal-300 block">
            Hackathon One-Click Demo Access:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('officer.sarah@campusshield.edu', 'OfficerPass123!')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] border border-slate-700 text-left transition"
            >
              <div className="font-bold text-teal-300 truncate">Officer Sarah Chen</div>
              <div className="text-[10px] text-slate-400">Safety Officer</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@campusshield.edu', 'AdminPass123!')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] border border-slate-700 text-left transition"
            >
              <div className="font-bold text-cyan-300 truncate">Director Jordan</div>
              <div className="text-[10px] text-slate-400">System Admin</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Official Campus Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@campusshield.edu"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:brightness-110 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Staff Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 text-center">
          Protected by Argon2id / BCrypt password hashing & HTTP-only sessions.
        </div>
      </div>
    </div>
  );
};
