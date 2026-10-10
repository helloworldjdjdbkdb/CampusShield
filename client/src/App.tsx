import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal';
import { LandingPage } from './pages/LandingPage';
import { SafetyResourcesPage } from './pages/SafetyResourcesPage';
import { ReportIncidentPage } from './pages/ReportIncidentPage';
import { ReportConfirmationPage } from './pages/ReportConfirmationPage';
import { TrackCasePage } from './pages/TrackCasePage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { CaseWorkspacePage } from './pages/CaseWorkspacePage';
import { AdminConsolePage } from './pages/AdminConsolePage';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Cross-page state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [submittedReportData, setSubmittedReportData] = useState<{
    caseId: string;
    trackingSecret: string;
    category: string;
    platform: string;
    createdAt: string;
  } | null>(null);

  const [trackPrefill, setTrackPrefill] = useState<{ caseId: string; secret: string }>({
    caseId: '',
    secret: '',
  });

  const handleReportSubmitted = (data: {
    caseId: string;
    trackingSecret: string;
    category: string;
    platform: string;
    createdAt: string;
  }) => {
    setSubmittedReportData(data);
    setCurrentTab('confirmation');
  };

  const handleGoToTracking = (caseId: string, secret: string) => {
    setTrackPrefill({ caseId, secret });
    setCurrentTab('track');
  };

  const handleOpenCaseWorkspace = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentTab('case-workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B] text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={setCurrentTab}
            onOpenPrivacyNotice={() => setPrivacyModalOpen(true)}
          />
        )}

        {currentTab === 'resources' && (
          <SafetyResourcesPage onNavigateToReport={() => setCurrentTab('report')} />
        )}

        {currentTab === 'report' && (
          <ReportIncidentPage
            onReportSubmitted={handleReportSubmitted}
            onOpenPrivacyNotice={() => setPrivacyModalOpen(true)}
          />
        )}

        {currentTab === 'confirmation' && submittedReportData && (
          <ReportConfirmationPage
            credentials={submittedReportData}
            onTrackCase={handleGoToTracking}
          />
        )}

        {currentTab === 'track' && (
          <TrackCasePage
            initialCaseId={trackPrefill.caseId}
            initialSecret={trackPrefill.secret}
          />
        )}

        {currentTab === 'staff-login' && (
          <StaffLoginPage onLoginSuccess={() => setCurrentTab('staff-dashboard')} />
        )}

        {currentTab === 'staff-dashboard' && (
          <StaffDashboardPage
            onOpenCase={handleOpenCaseWorkspace}
            onNavigateToAdmin={() => setCurrentTab('admin-console')}
          />
        )}

        {currentTab === 'case-workspace' && selectedCaseId && (
          <CaseWorkspacePage
            caseId={selectedCaseId}
            onBack={() => setCurrentTab('staff-dashboard')}
          />
        )}

        {currentTab === 'admin-console' && (
          <AdminConsolePage onBack={() => setCurrentTab('staff-dashboard')} />
        )}
      </main>

      <Footer onOpenPrivacyNotice={() => setPrivacyModalOpen(true)} />

      <PrivacyNoticeModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
