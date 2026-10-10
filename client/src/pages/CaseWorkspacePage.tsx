import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  Clock,
  UserCheck,
  AlertTriangle,
  Lock,
  MessageSquare,
  FileText,
  Paperclip,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  Download,
  History,
  Check,
  HelpCircle,
} from 'lucide-react';
import { CaseDetail, StaffUser, TriageResponse } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface CaseWorkspacePageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseWorkspacePage: React.FC<CaseWorkspacePageProps> = ({ caseId, onBack }) => {
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [officers, setOfficers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reporter-updates' | 'internal-notes' | 'follow-ups' | 'evidence' | 'audit' | 'ai-triage'>('reporter-updates');

  // Action states
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [newPriority, setNewPriority] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');

  // Reporter Update form
  const [reporterMsg, setReporterMsg] = useState('');
  const [requiresInput, setRequiresInput] = useState(false);
  const [sendingUpdate, setSendingUpdate] = useState(false);

  // Internal Note form
  const [internalNoteText, setInternalNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Resolution modal
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);

  // AI Triage
  const [triageData, setTriageData] = useState<TriageResponse | null>(null);
  const [runningTriage, setRunningTriage] = useState(false);

  const loadCase = async () => {
    try {
      const res = await api.getCaseDetail(caseId);
      setCaseData(res.case);
      setNewStatus(res.case.status);
      setNewPriority(res.case.priority);
      setAssignedOfficer(res.case.assignedOfficerId || '');
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async () => {
    try {
      const res = await api.getStaffUsers();
      setOfficers(res.users);
    } catch (err) {
      // Safety officer might get 403 on admin/users; handle gracefully
    }
  };

  useEffect(() => {
    loadCase();
    loadOfficers();
  }, [caseId]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData || newStatus === caseData.status) return;

    setUpdatingStatus(true);
    try {
      await api.updateStatus(caseData.id, newStatus, statusReason || undefined);
      setStatusReason('');
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!caseData) return;
    setNewPriority(priority);
    try {
      await api.updatePriority(caseData.id, priority);
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Priority update failed.');
    }
  };

  const handleOfficerAssign = async (officerId: string) => {
    if (!caseData) return;
    setAssignedOfficer(officerId);
    try {
      await api.assignOfficer(caseData.id, officerId || null);
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Officer assignment failed.');
    }
  };

  const handleSendReporterUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterMsg.trim() || !caseData) return;

    setSendingUpdate(true);
    try {
      await api.addReporterUpdate(caseData.id, reporterMsg.trim(), requiresInput);
      setReporterMsg('');
      setRequiresInput(false);
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Failed to post update.');
    } finally {
      setSendingUpdate(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim() || !caseData) return;

    setSavingNote(true);
    try {
      await api.addInternalNote(caseData.id, internalNoteText.trim());
      setInternalNoteText('');
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Failed to save internal note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleRecordResolution = async () => {
    if (!resolutionText.trim() || !caseData) return;
    setSavingResolution(true);
    try {
      await api.recordResolution(caseData.id, resolutionText.trim());
      setShowResolutionModal(false);
      await loadCase();
    } catch (err: any) {
      alert(err.message || 'Failed to record resolution.');
    } finally {
      setSavingResolution(false);
    }
  };

  const runAiTriage = async () => {
    if (!caseData) return;
    setRunningTriage(true);
    try {
      const data = await api.runTriage({
        description: caseData.description,
        platform: caseData.platform,
        currentCategory: caseData.category,
      });
      setTriageData(data);
    } catch (err: any) {
      alert(err.message || 'Triage assistant failed.');
    } finally {
      setRunningTriage(false);
    }
  };

  if (loading || !caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-2" />
        <span>Loading incident workspace...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-mono font-extrabold text-white">{caseData.id}</span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-teal-300 px-2 py-0.5 rounded font-sans">
                {caseData.category.replace('_', ' ')}
              </span>
              {caseData.isImmediateDanger && (
                <span className="text-xs bg-red-950 border border-red-700 text-red-300 font-bold px-2 py-0.5 rounded animate-pulse">
                  CRITICAL THREAT ALERT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Submitted on {new Date(caseData.createdAt).toLocaleString()} via {caseData.platform}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowResolutionModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Record Resolution & Close</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: DOSSIER & CONTROLS */}
        <div className="space-y-6">
          {/* Quick Action Controls */}
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Officer Controls</h3>

            {/* Status Transition */}
            <form onSubmit={handleStatusChange} className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">Incident Status Workflow</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ADDITIONAL_INFO_REQUESTED">Additional Info Requested</option>
                <option value="ACTION_IN_PROGRESS">Action in Progress</option>
                <option value="REFERRED_TO_AUTHORITY">Referred to Authority</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              {newStatus !== caseData.status && (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Reason for status change (logged to audit)..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    {updatingStatus ? 'Updating Status...' : 'Apply Status Transition'}
                  </button>
                </div>
              )}
            </form>

            {/* Priority Selector */}
            <div className="text-xs space-y-1.5">
              <label className="block text-slate-300 font-semibold">Priority Classification</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`py-1.5 rounded-lg font-bold text-[10px] transition border ${
                      caseData.priority === p
                        ? p === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-500'
                          : p === 'HIGH'
                          ? 'bg-orange-600 text-white border-orange-500'
                          : 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Officer Assignment */}
            {officers.length > 0 && (
              <div className="text-xs space-y-1.5">
                <label className="block text-slate-300 font-semibold">Assigned Duty Officer</label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => handleOfficerAssign(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="">Unassigned</option>
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.role === 'SYSTEM_ADMIN' ? 'Admin' : 'Officer'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Allegation Dossier Card */}
          <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Allegation Dossier</h3>

            <div>
              <span className="text-[11px] text-slate-400 block">Reporting Mode</span>
              <strong className="text-teal-300">{caseData.reportingMode}</strong>
              {caseData.reportingMode === 'IDENTIFIED' && (
                <div className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                  <div><strong>Name:</strong> {caseData.reporterName || 'N/A'}</div>
                  <div><strong>Email:</strong> {caseData.reporterEmail || 'N/A'}</div>
                  <div><strong>Phone:</strong> {caseData.reporterPhone || 'N/A'}</div>
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Reported Description</span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                {caseData.description}
              </div>
            </div>

            {caseData.profileUrl && (
              <div>
                <span className="text-[11px] text-slate-400 block">Target Profile URL</span>
                <a
                  href={caseData.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline font-mono break-all text-[11px]"
                >
                  {caseData.profileUrl}
                </a>
              </div>
            )}

            {caseData.resolutionDetails && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-700 rounded-xl text-emerald-200">
                <strong className="block text-[11px] uppercase tracking-wider mb-1">Official Resolution Details</strong>
                <p>{caseData.resolutionDetails}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE TABS */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
            {[
              { id: 'reporter-updates', label: 'Reporter Updates', count: caseData.reporterUpdates.length },
              { id: 'internal-notes', label: 'Internal Staff Notes (Private)', count: caseData.internalNotes?.length || 0 },
              { id: 'follow-ups', label: 'Reporter Follow-ups', count: caseData.followUps?.length || 0 },
              { id: 'evidence', label: 'Evidence Locker', count: caseData.evidence?.length || 0 },
              { id: 'audit', label: 'Audit Trail', count: caseData.statusHistory.length },
              { id: 'ai-triage', label: 'AI Triage Assistant', highlight: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeTab === tab.id
                    ? tab.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow'
                      : 'bg-blue-600/30 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: REPORTER UPDATES */}
          {activeTab === 'reporter-updates' && (
            <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Public Updates Visible to Reporter</h3>
                  <p className="text-xs text-slate-400">These messages appear directly on the student’s case tracking page.</p>
                </div>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                  PUBLIC TO REPORTER
                </span>
              </div>

              {/* Message List */}
              <div className="space-y-3">
                {caseData.reporterUpdates.map((u) => (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      u.requiresInput
                        ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-teal-300">
                        {u.createdBy?.name || 'Campus Safety Operations'}
                      </span>
                      <span>{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="leading-relaxed">{u.message}</p>
                    {u.requiresInput && (
                      <span className="inline-block mt-1 text-[10px] text-orange-300 font-bold uppercase tracking-wider">
                        Flagged: Requires Reporter Input
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Compose New Public Update */}
              <form onSubmit={handleSendReporterUpdate} className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">Post New Update to Reporter</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Platform takedown request submitted to Instagram trust and safety..."
                  value={reporterMsg}
                  onChange={(e) => setReporterMsg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center space-x-2 text-xs text-orange-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresInput}
                      onChange={(e) => setRequiresInput(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 bg-slate-900 border-slate-700"
                    />
                    <span>Request response / information from reporter (flags status)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={sendingUpdate || !reporterMsg.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                  >
                    {sendingUpdate ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Broadcast to Student</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: INTERNAL NOTES (STRICTLY PRIVATE) */}
          {activeTab === 'internal-notes' && (
            <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Confidential Internal Staff Notes</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Strictly confidential. Never returned to anonymous tracking endpoints.
                  </p>
                </div>
                <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-mono border border-red-800">
                  STAFF EYES ONLY
                </span>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {caseData.internalNotes?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No internal notes added yet.</p>
                ) : (
                  caseData.internalNotes?.map((note) => (
                    <div key={note.id} className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-amber-300">
                          {note.createdBy?.name || 'Safety Officer'}
                        </span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddInternalNote} className="pt-4 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-white">Record Confidential Case Note</label>
                <textarea
                  rows={3}
                  placeholder="Record investigative leads, IP lookups, student conduct board notes, or interview observations..."
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNote || !internalNoteText.trim()}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Private Note</span>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: REPORTER FOLLOW-UPS */}
          {activeTab === 'follow-ups' && (
            <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white">Incoming Anonymous Follow-Ups from Reporter</h3>
              <p className="text-xs text-slate-400">
                Responses submitted by the student using their tracking secret.
              </p>

              {caseData.followUps?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No follow-up replies received from the reporter.</p>
              ) : (
                <div className="space-y-3">
                  {caseData.followUps?.map((fu) => (
                    <div key={fu.id} className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs space-y-1">
                      <div className="text-[11px] text-teal-400 flex items-center justify-between">
                        <span>Anonymous Reporter Reply</span>
                        <span>{new Date(fu.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{fu.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVIDENCE LOCKER */}
          {activeTab === 'evidence' && (
            <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-teal-400" />
                <span>Isolated Private Evidence Locker</span>
              </h3>
              <p className="text-xs text-slate-400">
                Uploaded attachments stored in private vault outside web root. Download requires authorized staff session.
              </p>

              {caseData.evidence?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No attachments were uploaded with this report.</p>
              ) : (
                <div className="space-y-2">
                  {caseData.evidence?.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{file.originalName}</div>
                        <div className="text-[10px] text-slate-400">
                          {file.mimeType} • {(file.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <a
                        href={api.downloadEvidenceUrl(caseData.id, file.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold rounded-lg text-xs flex items-center space-x-1 border border-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-teal-400" />
                <span>Status History & Audit Trail</span>
              </h3>
              <div className="space-y-3">
                {caseData.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200">
                        Transition: {h.oldStatus} ➔ <strong className="text-teal-300">{h.newStatus}</strong>
                      </span>
                      <span>{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    {h.reason && <p className="text-slate-300 text-[11px]">{h.reason}</p>}
                    {h.changedBy && (
                      <span className="text-[10px] text-slate-500 block">By Officer: {h.changedBy.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AI / RULE-BASED TRIAGE ASSISTANT */}
          {activeTab === 'ai-triage' && (
            <div className="bg-[#0F1D38] border border-teal-500/30 rounded-2xl p-6 space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Intelligent Triage & Threat Scanning</span>
                  </h3>
                  <p className="text-[11px] text-teal-300">
                    Demo Classification — Not AI Verified. For human officer decision-making assistance only.
                  </p>
                </div>

                <button
                  onClick={runAiTriage}
                  disabled={runningTriage}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  {runningTriage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Scan Allegation Text</span>}
                </button>
              </div>

              {triageData ? (
                <div className="space-y-4 text-xs">
                  {/* Category & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Suggested Incident Classification</span>
                      <div className="font-bold text-teal-300 text-sm">{triageData.suggestedCategory}</div>
                      <div className="text-[11px] text-slate-400">{triageData.categoryReason}</div>
                      <div className="text-[10px] text-slate-500">Confidence: {(triageData.categoryConfidence * 100).toFixed(0)}%</div>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Recommended Priority Rating</span>
                      <div className="font-bold text-red-300 text-sm">{triageData.recommendedPriority}</div>
                      <div className="text-[11px] text-slate-400">
                        {triageData.urgencyFlags.length > 0
                          ? triageData.urgencyFlags.join(' ')
                          : 'Standard timeline triage recommended.'}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action Checklist */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-200 block text-xs">
                      Protocol Checklist for Duty Officer:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {triageData.recommendedActions.map((act, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Correlated Cases */}
                  {triageData.potentialCorrelatedCases.length > 0 && (
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                      <span className="font-semibold text-slate-200 block text-xs">
                        Correlated Recent Submissions on {caseData.platform}:
                      </span>
                      <div className="space-y-1 text-xs">
                        {triageData.potentialCorrelatedCases.map((cc) => (
                          <div key={cc.id} className="flex items-center justify-between text-slate-400 p-1.5 bg-slate-950 rounded">
                            <span className="font-mono text-teal-300">{cc.id}</span>
                            <span>{cc.category}</span>
                            <span className="text-[10px]">{new Date(cc.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-teal-400 mx-auto" />
                  <div>Click "Scan Allegation Text" to evaluate threat patterns and category hints.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {showResolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D172E] border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 text-slate-200 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Record Official Case Resolution</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recording a resolution will mark the case as <strong>RESOLVED</strong>, publish this final disposition to the reporter's timeline, and record the closing timestamp in the institutional audit log.
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Account @impostor was successfully suspended by Instagram Trust & Safety. Student conduct disciplinary warning issued..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResolutionModal(false)}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingResolution || !resolutionText.trim()}
                onClick={handleRecordResolution}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                {savingResolution ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Resolution & Close</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
