import React, { useState, useEffect } from 'react';
import {
  Search,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Lock,
  Loader2,
  FileText,
  FileCheck2,
  Info,
} from 'lucide-react';
import { CaseDetail } from '../types';
import { api } from '../api';

interface TrackCasePageProps {
  initialCaseId?: string;
  initialSecret?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    desc: 'Your report has been encrypted and received. Pending officer review.',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    desc: 'Campus Safety is evaluating the allegations and verifying account details.',
  },
  ADDITIONAL_INFO_REQUESTED: {
    label: 'Additional Info Needed',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    desc: 'Reviewing officer has requested clarification from you. Please reply below.',
  },
  REFERRED_TO_AUTHORITY: {
    label: 'Referred to Campus Authority',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    desc: 'Escalated to University Conduct Board or Campus Police for formal action.',
  },
  ACTION_IN_PROGRESS: {
    label: 'Action in Progress',
    color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    desc: 'Platform takedown request filed or administrative mediation underway.',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    desc: 'Official resolution recorded and active response completed.',
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-slate-700/40 text-slate-300 border-slate-600',
    desc: 'Case review finalized and closed.',
  },
};

export const TrackCasePage: React.FC<TrackCasePageProps> = ({
  initialCaseId = '',
  initialSecret = '',
}) => {
  const [caseId, setCaseId] = useState(initialCaseId);
  const [trackingSecret, setTrackingSecret] = useState(initialSecret);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);

  // Follow-up state
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  useEffect(() => {
    if (initialCaseId && initialSecret) {
      handleTrack(initialCaseId, initialSecret);
    }
  }, [initialCaseId, initialSecret]);

  const handleTrack = async (cId?: string, sec?: string) => {
    const idToUse = (cId || caseId).trim();
    const secToUse = (sec || trackingSecret).trim();

    if (!idToUse || !secToUse) {
      setError('Please provide both your Case ID and Tracking Secret.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.trackCase(idToUse, secToUse);
      setCaseData(data);
    } catch (err: any) {
      setCaseData(null);
      setError(err.message || 'Invalid Case ID or Tracking Secret combination.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpMsg.trim() || !caseData) return;

    setSendingFollowUp(true);
    setFollowUpSuccess(false);

    try {
      await api.submitFollowUp(caseData.id, trackingSecret, followUpMsg);
      setFollowUpSuccess(true);
      setFollowUpMsg('');
      // Re-fetch to update timeline
      await handleTrack(caseData.id, trackingSecret);
    } catch (err: any) {
      alert(err.message || 'Failed to submit follow-up.');
    } finally {
      setSendingFollowUp(false);
    }
  };

  // Quick Demo fill helper for hackathon judges
  const fillDemo = (id: string, secret: string) => {
    setCaseId(id);
    setTrackingSecret(secret);
    handleTrack(id, secret);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Search className="w-3.5 h-3.5" />
          <span>Anonymous Status Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Track My Incident Case</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Authenticate using your non-sequential Case ID and cryptographic tracking secret to view officer updates.
        </p>
      </div>

      {/* CREDENTIALS LOGIN FORM */}
      <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-4">
        {/* Hackathon Demo Quick Select */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Hackathon Evaluation Demos:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillDemo('CS-2026-F9K2A1', 'cs_sec_demo1234567890abcdef12345678')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-[11px] font-mono border border-slate-700 transition"
            >
              Demo: Instagram Fake Profile
            </button>
            <button
              type="button"
              onClick={() => fillDemo('CS-2026-X1L8Q4', 'cs_sec_freshman987654321fedcba98765')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-mono border border-slate-700 transition"
            >
              Demo: Action Needed / TikTok
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Case ID *
            </label>
            <input
              type="text"
              placeholder="e.g. CS-2026-F9K2A1"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tracking Secret *
            </label>
            <input
              type="password"
              placeholder="cs_sec_..."
              value={trackingSecret}
              onChange={(e) => setTrackingSecret(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:brightness-110 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Case Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* CASE STATUS DOSSIER */}
      {caseData && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-[#0F1D38] border border-blue-900/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400">AUTHENTICATED CASE FILE</span>
                <div className="text-2xl font-mono font-extrabold text-white">{caseData.id}</div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    STATUS_CONFIG[caseData.status]?.color || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {STATUS_CONFIG[caseData.status]?.label || caseData.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {STATUS_CONFIG[caseData.status]?.desc}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Category</span>
                <strong className="text-white">{caseData.category.replace('_', ' ')}</strong>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Platform</span>
                <strong className="text-white">{caseData.platform}</strong>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Submitted</span>
                <strong className="text-white">{new Date(caseData.createdAt).toLocaleDateString()}</strong>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Priority</span>
                <strong className="text-teal-300">{caseData.priority}</strong>
              </div>
            </div>

            {/* Description Review */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Original Allegation</span>
              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>
          </div>

          {/* REPORTER-VISIBLE UPDATES TIMELINE */}
          <div className="bg-[#0F1D38] border border-blue-900/60 rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Investigation Progress & Officer Communications</span>
            </h3>

            {caseData.reporterUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No updates posted yet.</p>
            ) : (
              <div className="space-y-4">
                {caseData.reporterUpdates.map((upd, idx) => (
                  <div
                    key={upd.id || idx}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      upd.requiresInput
                        ? 'bg-orange-950/30 border-orange-500/50 text-orange-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-teal-300 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Campus Safety Incident Response Team</span>
                      </span>
                      <span>{new Date(upd.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="leading-relaxed">{upd.message}</p>
                    {upd.requiresInput && (
                      <div className="inline-block px-2.5 py-0.5 rounded bg-orange-900/50 text-orange-300 text-[10px] font-bold uppercase tracking-wider">
                        Response Requested From Reporter
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PREVIOUS FOLLOW-UPS SENT BY REPORTER */}
            {caseData.followUps && caseData.followUps.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-400 block">Your Sent Follow-up Responses</span>
                {caseData.followUps.map((fu, idx) => (
                  <div key={fu.id || idx} className="bg-blue-950/30 p-3 rounded-xl border border-blue-900/40 text-xs">
                    <div className="text-[10px] text-slate-400 mb-1">{new Date(fu.createdAt).toLocaleString()}</div>
                    <p className="text-slate-200">{fu.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ANONYMOUS FOLLOW-UP FORM */}
            <form onSubmit={handleSendFollowUp} className="pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-white">
                Submit Additional Information / Reply Anonymously
              </label>
              <textarea
                rows={3}
                placeholder="Provide additional details, updated profile links, or respond to the officer request without revealing your identity..."
                value={followUpMsg}
                onChange={(e) => setFollowUpMsg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />

              {followUpSuccess && (
                <div className="text-emerald-300 text-xs flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Follow-up successfully delivered to campus safety officers.</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendingFollowUp || !followUpMsg.trim()}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  {sendingFollowUp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Anonymous Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
