/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicStudentProfileModal } from './PublicStudentProfileModal';
import { MonthlyReportSection } from './MonthlyReportSection';
import { Student } from '../types';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exportLeaderboardPDF, exportStudentReportPDF } from '../lib/pdfExport';
import { ActivitySubmission } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {

  Trophy,
  Award,
  Search,
  Download,
  Lock,
  Sparkles,
  Medal,
  Crown,
  BookOpen,
  GraduationCap,
  ExternalLink,
  X,
  ChevronRight,
  TrendingUp,
  Users,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  Flame,
  MapPin,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { students, submissions, settings, certificates, featuredTitles, badges } = useApp();
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'honors' | 'name'>('points');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  if (!settings.publicLeaderboard) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Campus Leaderboard is Private</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The public standing roster is currently set to private by institutional directive. Students can review their private individual standing inside their Student Portal.
        </p>
      </div>
    );
  }

  // Extract unique departments
  const departments: string[] = Array.from(new Set(students.map((s) => s.department)));

  // Filter students
  const filtered = students.filter((s) => {
    if (departmentFilter !== 'all' && s.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort students
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'points') return b.totalPoints - a.totalPoints;
    if (sortBy === 'honors') return b.approvedCount - a.approvedCount;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const topThree = sorted.slice(0, 3);
  const remainingStudents = sorted.slice(3);

  // Department student counts
  const getDeptCount = (dept: string) => {
    if (dept === 'all') return students.length;
    return students.filter((s) => s.department === dept).length;
  };

  // Stats
  const topScore = students.length ? Math.max(...students.map((s) => s.totalPoints)) : 0;
  const avgPoints = students.length
    ? Math.round(students.reduce((acc, s) => acc + s.totalPoints, 0) / students.length)
    : 0;
  const totalApproved = students.reduce((acc, s) => acc + s.approvedCount, 0);

  // Student Submissions for Dossier Modal
  const studentSubs = selectedStudent
    ? submissions.filter((s) => s.studentId === selectedStudent.id && s.status === 'approved')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Institutional Academic Merit Standings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Campus Merit Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
            Real-time dynamic academic ranking calculated from verified research papers, national conference presentations, hackathon titles, and institutional honors.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            id="export-leaderboard-btn"
            onClick={() => exportLeaderboardPDF(students, settings.organizationName)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
          >
            <Download className="w-4 h-4" />
            Download Official Leaderboard PDF
          </motion.button>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      </motion.div>

      {/* METRIC CARDS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Top Campus Score
            </span>
            <p className="text-2xl font-black text-slate-900">{topScore} pts</p>
            <span className="text-[10px] text-amber-600 font-bold">Rank #1 Benchmark</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Average Merit Score
            </span>
            <p className="text-2xl font-black text-slate-900">{avgPoints} pts</p>
            <span className="text-[10px] text-blue-600 font-bold">Across all disciplines</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Approved Honors
            </span>
            <p className="text-2xl font-black text-slate-900">{totalApproved}</p>
            <span className="text-[10px] text-emerald-600 font-bold">Verified credentials</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Academic Departments
            </span>
            <p className="text-2xl font-black text-slate-900">{departments.length}</p>
            <span className="text-[10px] text-purple-600 font-bold">{students.length} Scholars Enrolled</span>
          </div>
        </motion.div>
      </div>

      {/* DYNAMIC ANIMATED PODIUM FOR TOP 3 STUDENTS */}
      {sorted.length >= 3 && departmentFilter === 'all' && !searchQuery && (
        <div className="pt-4">
          <div className="text-center mb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
              Hall of Academic Laureates
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Top 3 Campus Achievers</h2>
            <p className="text-xs text-slate-500">Click any laureate card to view their complete academic dossier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto">
            {/* RANK #2 (Silver Medalist) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedStudent(topThree[1])}
              className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md text-center flex flex-col items-center order-2 md:order-1 relative group cursor-pointer overflow-hidden transition-all hover:border-slate-400 hover:shadow-xl"
            >
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black text-xs flex items-center gap-1 shadow-2xs">
                <span>🥈 #2 Rank</span>
              </div>
              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-blue-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>

              <div className="relative mt-4 mb-3">
                <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-tr from-slate-300 via-slate-100 to-white shadow-lg overflow-hidden border border-slate-300 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={topThree[1].avatarUrl}
                    alt={topThree[1].name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-slate-800 text-white font-black text-[10px] rounded-lg shadow-sm">
                  SILVER
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                {topThree[1].name}
              </h3>
              <p className="text-xs text-blue-700 font-bold mt-0.5">{topThree[1].course}</p>
              <p className="text-[11px] text-slate-400">{topThree[1].department}</p>
              {topThree[1].address && (
                <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                  <span>{topThree[1].address}</span>
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-around">
                <div>
                  <span className="text-2xl font-black text-slate-800 block">{topThree[1].totalPoints}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <span className="text-2xl font-black text-emerald-700 block">{topThree[1].approvedCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Honors</span>
                </div>
              </div>

              <button className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <span>View Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* RANK #1 (Gold Medalist / Campus Leader) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              onClick={() => setSelectedStudent(topThree[0])}
              className="bg-gradient-to-b from-amber-50 via-white to-amber-50/30 rounded-3xl p-8 border-2 border-amber-400 shadow-xl text-center flex flex-col items-center order-1 md:order-2 md:-translate-y-4 relative group cursor-pointer overflow-hidden transition-all hover:border-amber-500 hover:shadow-2xl"
            >
              {/* Crown Animation Badge */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-1 text-[10px] font-black text-slate-950 uppercase tracking-widest text-center shadow-xs flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Supreme Campus Scholar 2026</span>
              </div>

              <div className="relative mt-5 mb-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-28 h-28 rounded-2xl p-1.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 shadow-xl overflow-hidden border-2 border-amber-400 group-hover:scale-105 transition-transform duration-300"
                >
                  <img
                    src={topThree[0].avatarUrl}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </motion.div>
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg shadow-sm flex items-center gap-1">
                  🥇 GOLD #1
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                {topThree[0].name}
              </h3>
              <p className="text-xs text-blue-700 font-bold mt-0.5">{topThree[0].course}</p>
              <p className="text-[11px] text-slate-400">{topThree[0].department}</p>
              {topThree[0].address && (
                <p className="text-xs text-amber-900 font-bold flex items-center gap-1 mt-1 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>{topThree[0].address}</span>
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-amber-200/80 w-full flex items-center justify-around bg-amber-50/50 rounded-2xl p-3">
                <div>
                  <span className="text-3xl font-black text-amber-600 block">{topThree[0].totalPoints}</span>
                  <span className="text-[10px] text-amber-900 font-black uppercase tracking-wider">Academic Points</span>
                </div>
                <div className="h-9 w-px bg-amber-200" />
                <div>
                  <span className="text-3xl font-black text-emerald-700 block">{topThree[0].approvedCount}</span>
                  <span className="text-[10px] text-emerald-900 font-black uppercase tracking-wider">Approved Honors</span>
                </div>
              </div>

              <button className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 transition-all cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect Laureate Dossier</span>
              </button>
            </motion.div>

            {/* RANK #3 (Bronze Medalist) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedStudent(topThree[2])}
              className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-md text-center flex flex-col items-center order-3 relative group cursor-pointer overflow-hidden transition-all hover:border-amber-300 hover:shadow-xl"
            >
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs flex items-center gap-1 shadow-2xs">
                <span>🥉 #3 Rank</span>
              </div>
              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-blue-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>

              <div className="relative mt-4 mb-3">
                <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-tr from-amber-300 via-amber-100 to-white shadow-lg overflow-hidden border border-amber-300 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={topThree[2].avatarUrl}
                    alt={topThree[2].name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-700 text-white font-black text-[10px] rounded-lg shadow-sm">
                  BRONZE
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                {topThree[2].name}
              </h3>
              <p className="text-xs text-blue-700 font-bold mt-0.5">{topThree[2].course}</p>
              <p className="text-[11px] text-slate-400">{topThree[2].department}</p>
              {topThree[2].address && (
                <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1 mt-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                  <span>{topThree[2].address}</span>
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-around">
                <div>
                  <span className="text-2xl font-black text-amber-700 block">{topThree[2].totalPoints}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <span className="text-2xl font-black text-emerald-700 block">{topThree[2].approvedCount}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Honors</span>
                </div>
              </div>

              <button className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <span>View Full Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      )}

      {/* FILTER, SEARCH & SORT CONTROLS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar by name, course, admission number, or department..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Toggles & View Mode */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="points">Highest Points</option>
                <option value="honors">Most Verified Honors</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card Profiles View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Department:</span>
          <button
            onClick={() => setDepartmentFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              departmentFilter === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Departments</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              departmentFilter === 'all' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
            }`}>
              {students.length}
            </span>
          </button>

          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                departmentFilter === dept
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{dept}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                departmentFilter === dept ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {getDeptCount(dept)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: DYNAMIC ANIMATED CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((std, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            return (
              <motion.div
                key={std.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => setSelectedStudent(std)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isTop3
                    ? rank === 1
                      ? 'border-amber-300 shadow-md hover:border-amber-400 hover:shadow-xl'
                      : rank === 2
                      ? 'border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-lg'
                      : 'border-amber-200 shadow-sm hover:border-amber-300 hover:shadow-lg'
                    : 'border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-lg'
                }`}
              >
                {/* Rank Badge Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : rank === 3
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {rank === 1 && <Crown className="w-3.5 h-3.5" />}
                      {rank === 2 && <Medal className="w-3.5 h-3.5" />}
                      {rank === 3 && <Trophy className="w-3.5 h-3.5" />}
                      <span>Rank #{rank}</span>
                    </span>

                    {rank <= 5 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Top Scholar
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">{std.admissionNumber}</span>
                </div>

                {/* Profile Core */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={std.avatarUrl}
                      alt={std.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform shadow-sm shrink-0"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {std.name}
                    </h4>
                    <p className="text-xs text-blue-700 font-semibold truncate">{std.course}</p>
                    <p className="text-[11px] text-slate-500 truncate">{std.department}</p>
                    {std.address && (
                      <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                        <span>{std.address}</span>
                      </p>
                    )}
                    <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">Batch of {std.batch}</span>
                  </div>
                </div>

                {/* Bio Snippet */}
                {std.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {std.bio}
                  </p>
                )}

                {/* Score Strip */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verified Honors</span>
                    <span className="font-extrabold text-emerald-700">{std.approvedCount} Records</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Merit Score</span>
                    <span className="text-lg font-black text-blue-700">{std.totalPoints} pts</span>
                  </div>
                </div>

                {/* Action CTA footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span className="text-[11px] text-slate-400 font-medium group-hover:text-blue-600 transition-colors">
                    Click to inspect dossier
                  </span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: HIGH-DENSITY PROFESSIONAL TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-20">Rank</th>
                  <th className="py-3.5 px-4">Scholar Details</th>
                  <th className="py-3.5 px-4">Course & Department</th>
                  <th className="py-3.5 px-4">Academic Batch</th>
                  <th className="py-3.5 px-4">Verified Honors</th>
                  <th className="py-3.5 px-4 text-right">Merit Points</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((std, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={std.id}
                      onClick={() => setSelectedStudent(std)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-black">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 ${
                            rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : rank === 3
                              ? 'bg-amber-100 text-amber-900'
                              : 'text-slate-700'
                          }`}
                        >
                          #{rank}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatarUrl}
                            alt={std.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block group-hover:text-blue-700 transition-colors">
                              {std.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">{std.admissionNumber}</span>
                              {std.address && (
                                <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                  <span>{std.address}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">{std.course}</span>
                        <span className="text-[10px] text-slate-500">{std.department}</span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium">{std.batch}</td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                          {std.approvedCount} Records
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="text-base font-black text-blue-700">{std.totalPoints} pts</span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY SEARCH STATE */}
      {sorted.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Scholars Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No scholars match your current search query or department filter. Try clearing the filter or searching for another term.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDepartmentFilter('all');
            }}
            className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* DYNAMIC STUDENT DOSSIER MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white relative">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedStudent.avatarUrl}
                      alt={selectedStudent.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
                    />
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                      #{selectedStudent.rank || 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white">{selectedStudent.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                        Active Scholar
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 font-semibold">
                      {selectedStudent.admissionNumber} • {selectedStudent.course}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {selectedStudent.department} • Batch of {selectedStudent.batch}
                    </p>
                    {selectedStudent.address && (
                      <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mt-1 bg-white/10 px-2.5 py-0.5 rounded-lg w-fit border border-amber-300/30">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Address: {selectedStudent.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Score Ribbon */}
                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-center">
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Total Points</span>
                    <span className="text-xl font-black text-amber-300">{selectedStudent.totalPoints} pts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Approved Records</span>
                    <span className="text-xl font-black text-emerald-300">{selectedStudent.approvedCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Campus Rank</span>
                    <span className="text-xl font-black text-white">#{selectedStudent.rank || 1}</span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Biography */}
                {selectedStudent.bio && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                      Academic Biography & Citation
                    </span>
                    <p className="text-slate-600 leading-relaxed text-xs">{selectedStudent.bio}</p>
                  </div>
                )}

                {/* Submissions breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-700" />
                      <span>Verified Works & Honors ({studentSubs.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Institutional Database Records</span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {studentSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                              {sub.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{sub.date}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{sub.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub.venueOrOrganizer}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 block">
                            +{sub.awardedPoints} pts
                          </span>
                        </div>
                      </div>
                    ))}

                    {studentSubs.length === 0 && (
                      <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                        No approved public submissions recorded yet for this scholar.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Close Dossier
                </button>

                <button
                  onClick={() =>
                    exportStudentReportPDF(
                      selectedStudent,
                      studentSubs,
                      [],
                      settings.organizationName
                    )
                  }
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Scholar Dossier PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MonthlyReportSection onStudentClick={(id) => {
          const std = students.find(s => s.id === id);
          if (std) setSelectedStudentForProfile(std);
        }} />

      {selectedStudentForProfile && (
        <PublicStudentProfileModal
          student={selectedStudentForProfile}
          submissions={submissions.filter(s => s.studentId === selectedStudentForProfile.id)}
          certificates={certificates}
          featuredTitles={featuredTitles}
          badges={badges}
          onClose={() => setSelectedStudentForProfile(null)}
        />
      )}

    </div>
  );
};

