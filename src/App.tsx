/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';
import { PublicHome } from './components/PublicHome';
import { AchievementsView } from './components/AchievementsView';
import { PublicationsView } from './components/PublicationsView';
import { LeaderboardView } from './components/LeaderboardView';
import { AboutView } from './components/AboutView';
import { StudentPortal } from './components/StudentPortal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import { VerificationModal } from './components/VerificationModal';
import { Toast } from './components/Toast';

const MainLayout: React.FC = () => {
  const { activeView, isLoading, announcements } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg animate-bounce">
            <span className="text-xl font-bold">S</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Initializing Students Outreach Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Header />
      <AnnouncementBar announcements={announcements} />

      {/* Main Routed View */}
      <main className="flex-1">
        {activeView === 'home' && <PublicHome />}
        {activeView === 'achievements' && <AchievementsView />}
        {activeView === 'publications' && <PublicationsView />}
        {activeView === 'leaderboard' && <LeaderboardView />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'student-portal' && <StudentPortal />}
        {activeView === 'admin-panel' && <AdminPanel />}
      </main>

      {/* Modals & Overlays */}
      <AdminLoginModal />
      <StudentLoginModal />
      <VerificationModal />
      <Toast />

      {/* Footer */}
      {activeView !== 'admin-panel' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
