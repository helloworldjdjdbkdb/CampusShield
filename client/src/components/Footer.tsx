import React from 'react';
import { Shield, Lock, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onOpenPrivacyNotice: () => void }> = ({ onOpenPrivacyNotice }) => {
  return (
    <footer className="mt-auto bg-[#070D1E] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="text-sm font-bold text-white tracking-wide">CampusShield Digital Safety</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A privacy-first cyber incident reporting and resolution platform for higher education institutions. Protecting student safety through cryptographic anonymity and rapid platform escalation.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-teal-400 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Tracking & Salted Hashing</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Reporting Categories</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Fake Social Media Profiles & Cloning</li>
              <li>Targeted Cyberbullying & Group Defamation</li>
              <li>Non-Consensual Impersonation</li>
              <li>Cyberstalking & Physical Location Harassment</li>
              <li>Direct Threats of Harm</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Emergency & Crisis Support</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center justify-between">
                <span>Campus Police Dispatch:</span>
                <strong className="text-white">(555) 019-9111</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>National Crisis & Suicide Hotline:</span>
                <strong className="text-white">Dial 988</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Crisis Text Line:</span>
                <span className="text-slate-200">Text HOME to 741741</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Student Affairs & Title IX:</span>
                <span className="text-slate-200">Bldg 4, Suite 210</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">Legal & Privacy Notice</h4>
            <p className="text-slate-500 leading-relaxed">
              Every submission is treated as an allegation requiring verified review. CampusShield does not conduct vigilante actions or public shaming.
            </p>
            <button
              onClick={onOpenPrivacyNotice}
              className="text-teal-400 hover:text-teal-300 underline font-medium flex items-center space-x-1"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Read Full Anonymity & Privacy Policy</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 CampusShield Digital Safety Initiative. Developed for College Hackathon Demonstration.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Security Gateway Online</span>
            </span>
            <span>All Data Parametrized & Salted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
