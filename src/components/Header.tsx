/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Award,
  Users,
  Info,
  LogIn,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    userRole,
    currentStudent,
    logout,
    setShowStudentLoginModal,
    triggerLogoClick,
    logoClickCount,
    activeView,
    setActiveView,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'about', label: 'About', icon: Info },
  ];

  // Handler for clicking the logo:
  // 1. Immediately navigates to Home Page (satisfying User Request 3)
  // 2. Triggers the 4-consecutive-click secret admin authentication counter
  const handleLogoClick = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerLogoClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with 1-click Home navigation + 4-click Secret Admin Trigger */}
          <motion.div
            id="website-logo-trigger"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3.5 cursor-pointer select-none group py-1"
            title="Click to go Home (Secret Admin: 4 clicks)"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.organizationName}
                  className="w-10 h-10 object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <GraduationCap className="w-7 h-7 text-blue-100 group-hover:rotate-6 transition-transform duration-300" />
              )}
              
              {logoClickCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white"
                >
                  {logoClickCount}
                </motion.span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                Darul Huda Islamic University
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Students Outreach Dashboard
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation Links with Animated Pill Indicator */}
          <nav className="hidden md:flex items-center gap-1.5 relative">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-${link.id}`}
                  onClick={() => {
                    setActiveView(link.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                    isActive ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-blue-50 border border-blue-200/80 rounded-xl -z-10 shadow-2xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-blue-700 scale-110' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {userRole === 'student' && currentStudent ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('student-portal')}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer text-left"
                >
                  <img
                    src={currentStudent.avatarUrl}
                    alt={currentStudent.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-300 shadow-2xs"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentStudent.name}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">
                      {currentStudent.totalPoints} pts • Rank #{currentStudent.rank || '-'}
                    </span>
                  </div>
                </motion.button>
                <button
                  id="header-logout-btn"
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : userRole === 'admin' ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="nav-admin-dashboard"
                  onClick={() => setActiveView('admin-panel')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-bold hover:from-blue-800 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  Admin Dashboard
                </motion.button>
                <button
                  onClick={logout}
                  title="Logout Admin"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <motion.button
                id="header-student-login-btn"
                onClick={() => setShowStudentLoginModal(true)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {userRole === 'guest' && (
              <button
                onClick={() => setShowStudentLoginModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 overflow-hidden shadow-lg"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveView(link.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              {userRole === 'student' && currentStudent ? (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentStudent.avatarUrl}
                      alt={currentStudent.name}
                      className="w-9 h-9 rounded-full object-cover border border-blue-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{currentStudent.name}</p>
                      <p className="text-[11px] text-blue-600 font-bold">{currentStudent.totalPoints} pts • #{currentStudent.rank || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveView('student-portal');
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                    >
                      Portal
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : userRole === 'admin' ? (
                <div className="flex items-center justify-between p-3.5 bg-blue-50 rounded-xl">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Administrator
                  </span>
                  <button
                    onClick={() => {
                      setActiveView('admin-panel');
                      setMobileMenuOpen(false);
                    }}
                    className="px-3.5 py-1.5 text-xs bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowStudentLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20"
                >
                  <LogIn className="w-4 h-4" />
                  Student Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
