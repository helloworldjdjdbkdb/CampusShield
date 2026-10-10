import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  AlertOctagon,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Search,
} from 'lucide-react';

export const SafetyResourcesPage: React.FC<{ onNavigateToReport: () => void }> = ({
  onNavigateToReport,
}) => {
  const [activeTab, setActiveTab] = useState<'fake-profiles' | 'evidence' | 'platforms' | 'emergency'>('fake-profiles');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Campus Safety Resource Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Digital Safety, Evidence Preservation & Platform Takedowns
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Empowering university students with step-by-step guidance on recognizing digital harassment, preserving legal evidence standards, and utilizing official institutional pathways.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'fake-profiles', label: '1. Spotting Fake Profiles', icon: Search },
          { id: 'evidence', label: '2. Preserving Digital Evidence', icon: Camera },
          { id: 'platforms', label: '3. Platform Reporting Guides', icon: ExternalLink },
          { id: 'emergency', label: '4. Immediate Threats vs Allegations', icon: AlertOctagon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-teal-400/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Spotting Fake Profiles */}
      {activeTab === 'fake-profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span>Anatomy of a Fake Campus Profile</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Malicious actors frequently clone legitimate student profiles to cause embarrassment, spread false rumors in group chats, or send harassing DMs. Look for these common red flags:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Character Alterations in Handles</strong>
                  Small variations like underscores, double letters (e.g. <code>@sarah__chen</code> vs <code>@sarah_chen</code>), or numbers appended at the end.
                </div>
              </li>
              <li className="flex items-start space-x-2.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Account Creation Date & Low Follower Ratios</strong>
                  Brand new accounts created within days, with very few followers, zero mutual campus connections, yet suddenly messaging campus friends.
                </div>
              </li>
              <li className="flex items-start space-x-2.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Recycled Public Photos</strong>
                  Profile pictures taken from LinkedIn, high school yearbooks, or older Instagram feeds with no original recent posts.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span>Critical Safety Reminders: What NOT to Do</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5 bg-red-950/20 p-3 rounded-xl border border-red-900/40">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-200 block mb-0.5">Do Not Retaliate or Publicly Doxx</strong>
                    Do not attempt to "hack", dox, or post unsubstantiated accusations on campus forums. Vigilante actions frequently harm innocent individuals and violate the Student Conduct Code.
                  </div>
                </li>
                <li className="flex items-start space-x-2.5 bg-red-950/20 p-3 rounded-xl border border-red-900/40">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-200 block mb-0.5">Do Not Block Before Capturing Evidence</strong>
                    Blocking immediately cuts your view of the account before you can document the exact profile URL and post timestamps necessary for platform takedown.
                  </div>
                </li>
              </ul>
            </div>

            <button
              onClick={onNavigateToReport}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:brightness-110 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              Report an Impersonator Anonymously Now
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Preserving Evidence */}
      {activeTab === 'evidence' && (
        <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">How to Document and Preserve Digital Evidence</h3>
            <p className="text-xs text-slate-300">
              When university safety officers or platform trust teams review an allegation, high-integrity evidence ensures rapid action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Capture Full-Screen Uncropped Screenshots</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take uncropped screenshots showing the full device screen, including the battery icon, status bar, and device clock. This establishes a verifiable timeline.
              </p>
            </div>

            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Preserve Direct Web URLs & Account Handles</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Record the full web URL (e.g. <code>https://instagram.com/account_name</code>) rather than just a display name. Display names can change instantly, but URLs track the unique user ID.
              </p>
            </div>

            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Do Not Delete Message Threads</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep the raw conversation on your device without deleting it. If required for institutional conduct hearings, digital forensics can export the complete export archive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Guides */}
      {activeTab === 'platforms' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Social Platform Direct Escalation Links</h3>
            <p className="text-xs text-slate-300">
              CampusShield coordinates institutional takedown notices, but reporting directly through the platform’s native tools accelerates automated account freezing:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                {
                  platform: 'Instagram / Meta',
                  path: 'Profile -> Options (...) -> Report -> It’s pretending to be someone I know',
                  sla: '24-48 Hours',
                  url: 'https://help.instagram.com',
                },
                {
                  platform: 'Snapchat',
                  path: 'Press & hold username -> More -> Report -> They are impersonating someone',
                  sla: '12-24 Hours',
                  url: 'https://support.snapchat.com',
                },
                {
                  platform: 'TikTok',
                  path: 'Share icon -> Report -> Impersonation -> Myself or another person',
                  sla: '24-48 Hours',
                  url: 'https://support.tiktok.com',
                },
                {
                  platform: 'Discord',
                  path: 'Right-click message -> Report Message -> Harassment or Impersonation',
                  sla: '24-72 Hours',
                  url: 'https://support.discord.com',
                },
              ].map((p, i) => (
                <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.platform}</span>
                    <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      {p.sla}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.path}</p>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Support Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Emergency vs Allegations */}
      {activeTab === 'emergency' && (
        <div className="bg-[#0F1D38] border border-red-500/30 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertOctagon className="w-7 h-7" />
            <h3 className="text-xl font-bold text-white">Distinguishing Immediate Threats from Formal Allegations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-red-950/30 border border-red-900/50 p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-red-300 text-sm flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>Immediate Safety Concern (Emergency Action)</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                If the cyber misconduct involves any of the following, do not wait for online ticket triage:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Explicit threats of physical bodily violence.</li>
                <li>The perpetrator indicates they are physically outside your residence or class.</li>
                <li>Weapons, stalking devices, or suicidal ideation mentioned.</li>
              </ul>
              <div className="p-3 bg-red-900/40 rounded-xl border border-red-700/50 text-white font-semibold text-center">
                Call Campus Police Dispatch immediately at <strong>(555) 019-9111</strong> or <strong>911</strong>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-900/50 p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-teal-300 text-sm flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-teal-400" />
                <span>Formal Allegation & Administrative Review</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                If there is no imminent danger to life or physical health, CampusShield provides the ideal confidential pathway:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Fake profile removal & platform trust escalation.</li>
                <li>Group chat defamation and rumors investigated under Student Conduct.</li>
                <li>Institutional mediation without retaliatory confrontation.</li>
              </ul>
              <button
                onClick={onNavigateToReport}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-center transition"
              >
                Proceed to Secure Campus Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
