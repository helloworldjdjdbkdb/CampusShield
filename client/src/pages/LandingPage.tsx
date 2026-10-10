import React from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  UserCheck,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  ExternalLink,
  Clock,
  KeyRound,
  Users,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenPrivacyNotice: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenPrivacyNotice }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-900/30 border border-teal-500/30 text-teal-300 text-xs font-medium animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>CampusShield Active Institutional Cyber Defense Gateway</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Your Identity Protected.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Your Campus Safer.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report fake social media profiles, cyberbullying, doxxing, and online impersonation without creating an account or revealing who you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 shadow-xl shadow-blue-600/30 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Submit Anonymous Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 hover:text-white transition flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Track My Case</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <EyeOff className="w-4 h-4 text-teal-400" />
              <span>Zero-Identity Required</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Hashed Tracking Credentials</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>&lt; 24hr Institutional Triage</span>
            </div>
            <button
              onClick={onOpenPrivacyNotice}
              className="text-teal-400 hover:text-teal-300 underline font-medium"
            >
              Privacy & Due Process Policy
            </button>
          </div>
        </div>
      </section>

      {/* THREE STEP WORKFLOW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Anonymous Reporting Works</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            You don't need a student login, email address, or password to seek protection and hold bad actors accountable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#0F1D38]/80 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4 border border-blue-500/20 group-hover:scale-110 transition">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Submit Incident Allegation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the misconduct type (e.g., Fake Profile, Impersonation, Threats), provide incident context, and upload screenshots or evidence files to our secure locker.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0F1D38]/80 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg mb-4 border border-teal-500/20 group-hover:scale-110 transition">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Save Cryptographic Credentials</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The server generates a unique Case ID and a high-entropy Tracking Secret. Only a salted hash is saved on the server—your secret cannot be guessed or viewed by staff.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0F1D38]/80 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden group hover:border-teal-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4 border border-cyan-500/20 group-hover:scale-110 transition">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track Actions & Respond Safely</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your credentials anytime to check case review status, view officer progress updates, and answer questions through an anonymous two-way follow-up channel.
            </p>
          </div>
        </div>
      </section>

      {/* REPORTING CATEGORIES GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0D172E] border border-blue-900/50 rounded-3xl p-8 sm:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Protected Scenarios</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">What You Can Report Safely</h2>
            </div>
            <button
              onClick={() => onNavigate('resources')}
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
            >
              <span>Explore Evidence Preservation Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Fake Profiles & Account Cloning',
                desc: 'Unauthorized social accounts using your profile pictures, campus clubs, or likeness to mislead students.',
                tag: 'Instagram, Snapchat, TikTok',
              },
              {
                title: 'Online Impersonation',
                desc: 'Pretending to be student leaders, faculty, or classmates to send fraudulent or embarrassing communications.',
                tag: 'Email, Discord, LinkedIn',
              },
              {
                title: 'Targeted Cyberbullying',
                desc: 'Systematic humiliation, rumor threads, defamatory polls, or group chat harassment campaigns.',
                tag: 'Campus Group Chats, Forums',
              },
              {
                title: 'Online Harassment & Doxxing',
                desc: 'Non-consensual sharing of dorm room numbers, cell phone numbers, private photos, or academic schedules.',
                tag: 'Private Info Leaks',
              },
              {
                title: 'Threatening Messages',
                desc: 'Direct or implied threats of physical assault, property damage, or stalking on campus grounds.',
                tag: 'Immediate Escalation',
              },
              {
                title: 'Cyberstalking & Tracking',
                desc: 'Persistent unwanted tracking, surveillance through device beacons, or social media monitoring.',
                tag: 'Location Stalking',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#111F3E]/70 border border-slate-800 hover:border-blue-500/30 p-5 rounded-2xl space-y-2 transition"
              >
                <div className="text-[10px] font-mono text-teal-300 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded-full inline-block">
                  {item.tag}
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DUE PROCESS & SAFETY NOTICE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-teal-950/30 border border-teal-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>INSTITUTIONAL INTEGRITY & DUE PROCESS</span>
            </div>
            <h3 className="text-xl font-bold text-white">Every report is handled as a confidential allegation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CampusShield upholds academic due process. Submitting a report initiates a structured, evidence-based review by campus safety officers and Title IX coordinators. Reports are not public shaming mechanisms, and suspected parties are treated with fair investigation standards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
            >
              Start Anonymous Report
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className="px-6 py-3 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 text-white transition"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
