import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Search,
} from 'lucide-react';

interface ReportConfirmationPageProps {
  credentials: {
    caseId: string;
    trackingSecret: string;
    category: string;
    platform: string;
    createdAt: string;
  };
  onTrackCase: (caseId: string, secret: string) => void;
}

export const ReportConfirmationPage: React.FC<ReportConfirmationPageProps> = ({
  credentials,
  onTrackCase,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `CampusShield Incident Credentials:\nCase ID: ${credentials.caseId}\nTracking Secret: ${credentials.trackingSecret}\nSubmitted: ${new Date(credentials.createdAt).toLocaleString()}\nCategory: ${credentials.category}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const downloadCredentialsFile = () => {
    const content = `================================================
CAMPUSSHIELD SECURE CASE CREDENTIALS
================================================
Case ID:         ${credentials.caseId}
Tracking Secret: ${credentials.trackingSecret}
Category:        ${credentials.category}
Platform:        ${credentials.platform}
Timestamp:       ${new Date(credentials.createdAt).toISOString()}

INSTRUCTIONS:
1. Keep this file in a secure location.
2. Visit CampusShield and click "Track My Case".
3. Enter your Case ID and Tracking Secret to review officer updates
   and communicate anonymously.

SECURITY WARNING:
Because this report was filed anonymously without an identity account,
university staff CANNOT retrieve or reset this tracking secret if lost.
================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusShield_${credentials.caseId}_Credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report Successfully Submitted</h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Your report has been encrypted and logged to the institutional database. Save your tracking credentials below.
        </p>
      </div>

      {/* CREDENTIALS VAULT CARD */}
      <div className="bg-[#0F1D38] border-2 border-teal-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
          Single-View Secret
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-950/40 border border-amber-600/50 p-4 rounded-xl flex items-start space-x-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-amber-300 mb-0.5">Important: Save These Credentials Now!</strong>
            The tracking secret below is displayed only once. It is hashed on our servers, meaning neither campus staff nor system administrators can recover it for you.
          </div>
        </div>

        {/* Case ID & Secret */}
        <div className="space-y-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Unique Case Identifier
            </span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-teal-300 select-all">
              {credentials.caseId}
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block flex items-center justify-between">
              <span>Cryptographic Tracking Secret</span>
              <span className="text-red-400 font-semibold text-[10px]">Shown Once Only</span>
            </span>
            <div className="text-xs sm:text-sm font-mono text-cyan-300 break-all select-all font-semibold bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              {credentials.trackingSecret}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Credentials Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Credentials</span>
              </>
            )}
          </button>

          <button
            onClick={downloadCredentialsFile}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Download .TXT File</span>
          </button>
        </div>

        {/* Go to Tracking CTA */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => onTrackCase(credentials.caseId, credentials.trackingSecret)}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-400 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <Search className="w-4 h-4" />
            <span>Go to "Track My Case" Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
