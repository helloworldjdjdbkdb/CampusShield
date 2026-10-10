import React, { useState } from 'react';
import {
  FileText,
  Shield,
  EyeOff,
  User,
  AlertTriangle,
  Upload,
  Calendar,
  Globe,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { IncidentCategory } from '../types';
import { api } from '../api';

interface ReportIncidentPageProps {
  onReportSubmitted: (data: {
    caseId: string;
    trackingSecret: string;
    category: string;
    platform: string;
    createdAt: string;
  }) => void;
  onOpenPrivacyNotice: () => void;
}

const CATEGORIES: { id: IncidentCategory; label: string; desc: string }[] = [
  { id: 'FAKE_PROFILE', label: 'Fake Social Profile', desc: 'Cloned accounts, unauthorized pictures, finstas' },
  { id: 'CYBERBULLYING', label: 'Targeted Cyberbullying', desc: 'Group chat harassment, defamatory threads, humiliation' },
  { id: 'IMPERSONATION', label: 'Online Impersonation', desc: 'Pretending to be student leaders, faculty, or peers' },
  { id: 'ONLINE_HARASSMENT', label: 'Online Harassment & Doxxing', desc: 'Unwanted persistent contact, leaking private personal info' },
  { id: 'THREATS', label: 'Threats & Intimidation', desc: 'Direct or implied threats of physical harm' },
  { id: 'CYBERSTALKING', label: 'Cyberstalking', desc: 'Persistent surveillance, location monitoring, AirTag tracking' },
  { id: 'OTHER', label: 'Other Digital Misconduct', desc: 'Other forms of digital misconduct or abuse' },
];

const PLATFORMS = [
  'Instagram',
  'Discord',
  'Snapchat',
  'TikTok',
  'X (formerly Twitter)',
  'GroupMe / WhatsApp',
  'Reddit / Campus Forum',
  'Email',
  'Other Platform',
];

export const ReportIncidentPage: React.FC<ReportIncidentPageProps> = ({
  onReportSubmitted,
  onOpenPrivacyNotice,
}) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<IncidentCategory>('FAKE_PROFILE');
  const [platform, setPlatform] = useState('Instagram');
  const [customPlatform, setCustomPlatform] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isImmediateDanger, setIsImmediateDanger] = useState(false);
  const [reportingMode, setReportingMode] = useState<'ANONYMOUS' | 'IDENTIFIED'>('ANONYMOUS');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [privacyNoticeAck, setPrivacyNoticeAck] = useState(false);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const valid = selected.filter((f) => f.size <= 10 * 1024 * 1024);
    if (valid.length < selected.length) {
      alert('Some files were ignored because they exceed the 10 MB limit.');
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    setFormError(null);
    if (currentStep === 1) {
      if (!category) {
        setFormError('Please select an incident category.');
        return false;
      }
      if (!platform) {
        setFormError('Please select a platform.');
        return false;
      }
      if (platform === 'Other Platform' && !customPlatform.trim()) {
        setFormError('Please specify the platform name.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (description.trim().length < 15) {
        setFormError('Please describe the incident in at least 15 characters.');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!privacyNoticeAck) {
        setFormError('You must acknowledge the privacy notice to proceed.');
        return false;
      }
      if (reportingMode === 'IDENTIFIED' && !reporterEmail.trim()) {
        setFormError('Please provide an email address for identified reporting.');
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setFormError(null);
    setStep((s) => s - 1);
  };

  // Final submission
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const finalPlatform = platform === 'Other Platform' ? customPlatform.trim() : platform;

      const formData = new FormData();
      formData.append('category', category);
      formData.append('platform', finalPlatform);
      formData.append('incidentDate', incidentDate);
      formData.append('description', description);
      if (profileUrl.trim()) formData.append('profileUrl', profileUrl.trim());
      formData.append('isImmediateDanger', String(isImmediateDanger));
      formData.append('reportingMode', reportingMode);
      if (reportingMode === 'IDENTIFIED') {
        if (reporterName) formData.append('reporterName', reporterName.trim());
        if (reporterEmail) formData.append('reporterEmail', reporterEmail.trim());
        if (reporterPhone) formData.append('reporterPhone', reporterPhone.trim());
      }
      formData.append('privacyNoticeAck', String(privacyNoticeAck));

      for (const file of files) {
        formData.append('evidenceFiles', file);
      }

      const res = await api.submitReport(formData);
      onReportSubmitted({
        caseId: res.caseId,
        trackingSecret: res.trackingSecret,
        category: res.category,
        platform: res.platform,
        createdAt: res.createdAt,
      });
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-teal-300 text-xs font-semibold">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Encrypted Anonymous Incident Submission</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report a Cyber Incident</h1>
        <p className="text-xs text-slate-400">
          Step {step} of 4 — All reports are securely persisted and reviewed by campus safety officers.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-800 -z-0"></div>
        {[
          { num: 1, label: 'Category & Platform' },
          { num: 2, label: 'Details & Evidence' },
          { num: 3, label: 'Identity & Safety' },
          { num: 4, label: 'Review & Submit' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                step === s.num
                  ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20'
                  : step > s.num
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-1 hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY & PLATFORM */}
      {step === 1 && (
        <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Incident Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    category === cat.id
                      ? 'bg-blue-600/20 border-teal-400/80 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-0.5">{cat.label}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Social Media or Messaging Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Approximate Incident Date *
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {platform === 'Other Platform' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Specify Platform Name *
              </label>
              <input
                type="text"
                placeholder="e.g. BeReal, Telegram, Campus Forum..."
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:brightness-110 shadow-md transition"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS & EVIDENCE */}
      {step === 2 && (
        <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Detailed Incident Description *
              </label>
              <span className="text-[11px] text-slate-400">{description.length} / 5000 chars</span>
            </div>
            <textarea
              rows={5}
              placeholder="Provide as much context as possible. Include what happened, how long it has been occurring, specific handles or group chats involved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Profile URL or Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/suspect_handle"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Upload Screenshots & Evidence (Max 5 files, 10MB each)
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-2xl p-6 text-center space-y-2 bg-slate-900/40 transition">
              <Upload className="w-8 h-8 text-teal-400 mx-auto" />
              <div className="text-xs text-slate-300">
                <label className="cursor-pointer text-teal-400 hover:text-teal-300 font-semibold underline">
                  Choose files
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>{' '}
                or drag and drop here
              </div>
              <p className="text-[11px] text-slate-500">Supported: JPG, PNG, WEBP, GIF, PDF, TXT</p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="text-slate-200 truncate">{file.name}</span>
                      <span className="text-slate-500 text-[10px]">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:brightness-110 shadow-md transition"
            >
              <span>Continue to Safety Settings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IDENTITY & SAFETY CHECK */}
      {step === 3 && (
        <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          {/* Immediate Danger Checkbox */}
          <div
            className={`p-4 rounded-xl border transition ${
              isImmediateDanger ? 'bg-red-950/40 border-red-500/80 text-red-200' : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isImmediateDanger}
                onChange={(e) => setIsImmediateDanger(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded bg-slate-950 border-slate-700 mt-1"
              />
              <div>
                <span className="font-bold text-sm block text-red-300">
                  Immediate Physical Safety Concern / Imminent Danger
                </span>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Check this box if you believe there is an immediate risk of physical harm, weapon possession, or emergency danger.
                  This immediately flags the ticket as <strong>CRITICAL</strong> priority for rapid duty officer alert.
                </span>
              </div>
            </label>
          </div>

          {/* Reporting Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Reporting Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportingMode('ANONYMOUS')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  reportingMode === 'ANONYMOUS'
                    ? 'bg-blue-600/20 border-teal-400 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs text-white mb-1">
                  <EyeOff className="w-4 h-4 text-teal-400" />
                  <span>Anonymous Report (Recommended)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  No personal identity is collected. You track progress via your one-time cryptographic secret.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportingMode('IDENTIFIED')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  reportingMode === 'IDENTIFIED'
                    ? 'bg-blue-600/20 border-teal-400 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs text-white mb-1">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Identified Report</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Provide your name/email so officers can contact you directly for formal conduct hearings.
                </p>
              </button>
            </div>
          </div>

          {reportingMode === 'IDENTIFIED' && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campus / Contact Email *</label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}

          {/* Privacy Notice Ack */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyNoticeAck}
                onChange={(e) => setPrivacyNoticeAck(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded bg-slate-950 border-slate-700 mt-0.5"
              />
              <span className="text-xs text-slate-300">
                I understand that this report represents an allegation that will be evaluated confidentially under institutional policies. I acknowledge the{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacyNotice}
                  className="text-teal-400 hover:text-teal-300 underline font-semibold"
                >
                  CampusShield Privacy & Anonymity Protocol
                </button>
                . *
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 hover:brightness-110 shadow-md transition"
            >
              <span>Review Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="bg-[#0F1D38] border border-blue-900/50 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <span>Review Submission Details</span>
          </h3>

          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <strong className="text-white">{category.replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Platform</span>
                <strong className="text-white">{platform === 'Other Platform' ? customPlatform : platform}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Incident Date</span>
                <strong className="text-white">{incidentDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reporting Mode</span>
                <strong className="text-teal-300">{reportingMode}</strong>
              </div>
            </div>

            {isImmediateDanger && (
              <div className="p-2 bg-red-950/40 border border-red-800 rounded-lg text-red-200 font-semibold text-[11px]">
                ⚠️ Immediate Safety Hazard Flagged — Fast-track Duty Alert
              </div>
            )}

            <div>
              <span className="text-slate-400 block text-[11px]">Description Summary</span>
              <p className="text-slate-200 mt-1 whitespace-pre-wrap">{description}</p>
            </div>

            {profileUrl && (
              <div>
                <span className="text-slate-400 block text-[11px]">Target Profile URL</span>
                <span className="text-teal-400 font-mono text-[11px] truncate block">{profileUrl}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 block text-[11px]">Attached Evidence Files</span>
              <span className="text-slate-300 font-semibold">
                {files.length > 0 ? `${files.length} file(s) attached` : 'None attached'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-slate-300">
            ℹ️ Upon dispatch, a <strong>Case ID</strong> and <strong>single-use Tracking Secret</strong> will be generated. You will need to save them to check status later.
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              disabled={submitting}
              onClick={prevStep}
              className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Encrypting & Dispatching...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Confirm & Submit Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
