import React from 'react';
import { X, ShieldCheck, EyeOff, KeyRound, AlertTriangle, Database, CheckCircle2 } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D172E] border border-blue-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200 p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">CampusShield Privacy & Anonymity Protocol</h3>
            <p className="text-xs text-slate-400">Institutional Cybersecurity & Data Governance Notice</p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4 flex items-start space-x-3">
            <EyeOff className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">True Zero-Identity Anonymous Submissions</h4>
              <p>
                When you choose Anonymous Reporting, you are never asked for your legal name, student ID number, university email, phone number, or login credentials. No account is created in your name.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start space-x-3">
            <KeyRound className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Cryptographic Tracking Secrets</h4>
              <p>
                Instead of requiring a username and password, CampusShield generates a high-entropy tracking secret (e.g., <code className="text-teal-300 bg-slate-950 px-1 py-0.5 rounded">cs_sec_...</code>).
                This secret is displayed to you <strong>only once</strong> at submission time. The server hashes it using salted bcrypt. Neither campus staff nor system administrators can read your secret token.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start space-x-3">
            <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Data Minimization & Evidence Storage</h4>
              <p>
                Uploads are stored in an isolated, private file vault outside public web roots. Files are given randomized UUID identifiers, preventing directory harvesting. Access is restricted exclusively to authorized safety officers reviewing your case.
              </p>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-200 text-sm mb-1">Limits of Anonymity & Due Process</h4>
              <p className="text-amber-300/90">
                Reports represent allegations that will be thoroughly evaluated under university conduct guidelines. CampusShield does not conduct vigilante retaliation.
                If a report details an immediate, credible threat of violent harm or emergency danger to life, campus safety officers are legally required to notify emergency dispatch.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2 font-semibold text-slate-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Summary of Student Protections</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>No cookies track your personal browsing outside your session.</li>
              <li>Case progress can be tracked anytime using your secret without identifying yourself.</li>
              <li>You can communicate follow-up details to officers anonymously.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-lg transition"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
