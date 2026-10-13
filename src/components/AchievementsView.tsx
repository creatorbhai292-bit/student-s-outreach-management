/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivitySubmission, ActivityCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Search, Filter, Calendar, ExternalLink, Eye, BookOpen, Trophy, Sparkles, X } from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { submissions } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<ActivitySubmission | null>(null);

  const approved = submissions.filter((s) => s.status === 'approved');

  const filtered = approved.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.studentName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.venueOrOrganizer && s.venueOrOrganizer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider"
        >
          <Award className="w-4 h-4 text-blue-700" />
          Institutional Repository
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
        >
          Verified Student Achievements
        </motion.h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Discover vetted student participations, academic symposium presentations, collegiate honors, and literary recognitions.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, topic, or organizer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Showing {filtered.length} Achievements
          </span>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'publication', label: 'Publications' },
            { id: 'paper_presentation', label: 'Paper Presentations' },
            { id: 'seminar', label: 'Seminars' },
            { id: 'college_program', label: 'College Programs' },
            { id: 'outside_program', label: 'Outside Programs' },
            { id: 'competition', label: 'Competitions' },
            { id: 'award', label: 'Awards' },
          ].map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid of Achievements with Motion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((sub, idx) => (
            <motion.div
              layout
              key={sub.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedSub(sub)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between cursor-pointer group"
            >
              {sub.imageUrl ? (
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={sub.imageUrl}
                    alt={sub.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {sub.category.replace('_', ' ')}
                  </div>
                </div>
              ) : (
                <div className="h-32 w-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between px-6">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                    {sub.category.replace('_', ' ')}
                  </span>
                  <Award className="w-8 h-8 text-blue-300" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 text-[11px] font-medium">{sub.date}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] shadow-2xs">
                      +{sub.awardedPoints} pts
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                    {sub.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">{sub.studentName}</span>
                  <span className="text-blue-600 flex items-center gap-1 font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                    <span>View Details</span> <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No achievements found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or category filters.</p>
        </div>
      )}

      {/* Modal Detail with Motion */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setSelectedSub(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="px-2.5 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase text-white">
                {selectedSub.category.replace('_', ' ')}
              </span>
              <h3 className="text-xl font-bold mt-2">{selectedSub.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Conferred upon {selectedSub.studentName}</p>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {selectedSub.imageUrl && (
                <div className="w-full h-56 rounded-xl overflow-hidden bg-slate-100">
                  <img src={selectedSub.imageUrl} alt={selectedSub.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block font-medium">Student</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSub.studentName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block font-medium">Date</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSub.date}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block mb-1">Full Summary</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedSub.description}
                </p>
              </div>

              {selectedSub.externalLink && (
                <a
                  href={selectedSub.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Original Source / Publication
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
