/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivitySubmission } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, ExternalLink, Calendar, Eye, User, Sparkles, X, ArrowRight } from 'lucide-react';

export const PublicationsView: React.FC = () => {
  const { submissions } = useApp();
  const [subTypeFilter, setSubTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPub, setSelectedPub] = useState<ActivitySubmission | null>(null);

  const publications = submissions.filter((s) => s.category === 'publication' && s.status === 'approved');

  const genres = [
    { id: 'all', label: 'All Publications' },
    { id: 'Article', label: 'Articles' },
    { id: 'Ghazal', label: 'Ghazals' },
    { id: 'Naat', label: 'Naats' },
    { id: 'Essay', label: 'Essays' },
    { id: 'Poem', label: 'Poems' },
    { id: 'Story', label: 'Stories' },
    { id: 'Research Article', label: 'Research Papers' },
    { id: 'Newspaper Article', label: 'Newspaper Columns' },
  ];

  const filtered = publications.filter((p) => {
    if (subTypeFilter !== 'all' && p.subType !== subTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.venueOrOrganizer && p.venueOrOrganizer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider"
        >
          <BookOpen className="w-4 h-4 text-indigo-700" />
          Literary & Academic Works
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
        >
          Student Publications Repository
        </motion.h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Peer-reviewed journal papers, newspaper columns, ghazals, naats, essays, and creative writing published by campus students.
        </p>
      </div>

      {/* Filter Bar with Animated Pills */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by publication title, author, journal, or newspaper..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
            />
          </div>
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {filtered.length} Published Works
          </span>
        </div>

        {/* Genre Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {genres.map((g) => (
            <motion.button
              key={g.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSubTypeFilter(g.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                subTypeFilter === g.id
                  ? 'bg-indigo-700 text-white shadow-md shadow-indigo-700/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {g.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid with Dynamic Motion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((pub, idx) => (
            <motion.div
              layout
              key={pub.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedPub(pub)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between cursor-pointer group"
            >
              {pub.imageUrl ? (
                <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={pub.imageUrl}
                    alt={pub.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                    {pub.subType || 'Article'}
                  </div>
                </div>
              ) : (
                <div className="h-36 w-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-between px-6">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                    {pub.subType || 'Publication'}
                  </span>
                  <BookOpen className="w-8 h-8 text-indigo-300" />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium text-[11px] truncate max-w-[180px]">
                      {pub.venueOrOrganizer || pub.date}
                    </span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-[11px] shadow-2xs">
                      +{pub.awardedPoints} pts
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {pub.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {pub.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{pub.studentName}</span>
                  <span className="text-indigo-600 flex items-center gap-1 font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                    <span>Read More</span> <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No publications found</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting another genre or searching for different keywords.</p>
        </div>
      )}

      {/* Modal Detail with Animation */}
      {selectedPub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setSelectedPub(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-bold uppercase text-white">
                  {selectedPub.subType || 'Publication'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-[10px] font-bold text-white">
                  +{selectedPub.awardedPoints} Verified Points
                </span>
              </div>
              <h3 className="text-xl font-bold">{selectedPub.title}</h3>
              <p className="text-xs text-slate-400 mt-1">Author: {selectedPub.studentName}</p>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {selectedPub.imageUrl && (
                <div className="w-full h-60 rounded-xl overflow-hidden bg-slate-100">
                  <img src={selectedPub.imageUrl} alt={selectedPub.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block font-medium">Published In</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPub.venueOrOrganizer || 'Campus Gazette'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block font-medium">Publication Date</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPub.date}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block mb-1">Abstract & Context</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedPub.description}
                </p>
              </div>

              {selectedPub.externalLink && (
                <a
                  href={selectedPub.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Original Publication / Article
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
