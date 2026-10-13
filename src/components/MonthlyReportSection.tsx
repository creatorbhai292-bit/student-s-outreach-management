import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { Calendar, ChevronLeft, Award, FileText, Star, Trophy } from 'lucide-react';

interface Props {
  onStudentClick?: (studentId: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES: { id: ActivityCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Categories', icon: Star },
  { id: 'publication', label: 'Publications', icon: FileText },
  { id: 'paper_presentation', label: 'Presentations', icon: FileText },
  { id: 'seminar', label: 'Seminars', icon: Award },
  { id: 'college_program', label: 'College Programs', icon: Award },
  { id: 'outside_program', label: 'Outside Programs', icon: Award },
  { id: 'competition', label: 'Competitions', icon: Trophy },
  { id: 'award', label: 'Awards', icon: Trophy },
  { id: 'other_activity', label: 'Other', icon: Star },
];

export const MonthlyReportSection: React.FC<Props> = ({ onStudentClick }) => {
  const { submissions, students } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');

  const approvedSubs = useMemo(() => submissions.filter((s) => s.status === 'approved'), [submissions]);

  const availableYears = useMemo(() => {
    const years = new Set(approvedSubs.map(s => new Date(s.date).getFullYear().toString()));
    years.add('2025'); // Ensure 2025 is always an option as requested
    return Array.from(years).sort((a, b) => (b as string).localeCompare(a as string));
  }, [approvedSubs]);

  const monthStats = useMemo(() => {
    return MONTH_NAMES.map((name, index) => {
      const subs = approvedSubs.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear().toString() === selectedYear && d.getMonth() === index;
      });
      const points = subs.reduce((acc, curr) => acc + curr.awardedPoints, 0);
      return { name, index, count: subs.length, points };
    });
  }, [approvedSubs, selectedYear]);

  const filteredSubmissions = useMemo(() => {
    if (selectedMonth === null) return [];
    return approvedSubs.filter(s => {
      const d = new Date(s.date);
      const isCorrectMonth = d.getFullYear().toString() === selectedYear && d.getMonth() === selectedMonth;
      const isCorrectCategory = selectedCategory === 'all' || s.category === selectedCategory;
      return isCorrectMonth && isCorrectCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [approvedSubs, selectedYear, selectedMonth, selectedCategory]);

  return (
    <div className="mt-20 pt-16 border-t border-slate-200/60 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-slate-50 text-slate-400 rounded-full text-xs font-bold tracking-widest uppercase border border-slate-200">
        Analytics
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Monthly Reports
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Review student achievements tracked by month and year.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-3">Year</span>
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth(null); }}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedMonth === null ? (
          <motion.div
            key="months-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {monthStats.map(stat => {
              const hasData = stat.count > 0;
              return (
                <motion.div
                  key={stat.index}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedMonth(stat.index)}
                  className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 flex flex-col items-center justify-center text-center group ${
                    hasData 
                      ? 'bg-white shadow-sm hover:shadow-xl hover:border-blue-400 border-slate-200/80 relative overflow-hidden' 
                      : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100 border-dashed hover:border-solid hover:border-blue-300'
                  }`}
                >
                  {hasData && (
                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:bg-blue-500/10" />
                  )}
                  <h3 className={`text-xl font-black tracking-tight transition-colors z-10 ${
                    hasData ? 'text-slate-800 group-hover:text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {stat.name}
                  </h3>
                  <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xs font-bold z-10">
                    <span className={`px-3 py-1 rounded-full ${hasData ? 'bg-slate-100 text-slate-600' : 'bg-transparent text-slate-400'}`}>
                      {stat.count} Activities
                    </span>
                    {hasData && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                        +{stat.points} pts
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="month-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <button 
                onClick={() => { setSelectedMonth(null); setSelectedCategory('all'); }} 
                className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:shadow-sm transition-all group shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </button>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5">Showing {filteredSubmissions.length} approved activities</p>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-3 mb-8 scrollbar-hide">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`} />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Submissions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub, idx) => {
                  const student = students.find(s => s.id === sub.studentId);
                  const canClick = student?.isPublicProfileEnabled && onStudentClick;
                  return (
                    <motion.div
                      key={sub.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      onClick={() => {
                        if (canClick) {
                          onStudentClick(student.id);
                        }
                      }}
                      className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4 relative overflow-hidden group ${
                        canClick ? 'cursor-pointer hover:shadow-xl hover:border-blue-400 transition-all duration-300' : ''
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-blue-50 transition-colors" />
                      
                      <div className="flex items-start justify-between gap-4 z-10">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={student?.avatarUrl || 'https://via.placeholder.com/150'} 
                            className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 shrink-0" 
                            alt="" 
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{student?.name || 'Unknown Student'}</h4>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mt-0.5">{student?.course}</p>
                          </div>
                        </div>
                        <span className="shrink-0 font-black text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 text-xs shadow-sm">
                          +{sub.awardedPoints}
                        </span>
                      </div>
                      
                      <h5 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 mt-1 z-10">
                        {sub.title}
                      </h5>
                      
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-auto pt-4 border-t border-slate-100/80 z-10">
                        <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          {new Date(sub.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                          {sub.category.replace('_', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-200 border-dashed rounded-[2rem]"
                  >
                    <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
                      <Star className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Achievements Found</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">
                      We couldn't find any approved activities for this specific category in {MONTH_NAMES[selectedMonth]} {selectedYear}.
                    </p>
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="mt-6 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      View All Categories
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
