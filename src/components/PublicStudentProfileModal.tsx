import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, FileText, Medal, Trophy, Star, BookOpen, User, GraduationCap, Building2 } from 'lucide-react';
import { Student, ActivitySubmission, IssuedCertificate, FeaturedStudentTitle, AchievementBadge } from '../types';

interface Props {
  student: Student;
  submissions: ActivitySubmission[];
  certificates: IssuedCertificate[];
  featuredTitles: FeaturedStudentTitle[];
  badges: AchievementBadge[];
  onClose: () => void;
}

export const PublicStudentProfileModal: React.FC<Props> = ({
  student,
  submissions,
  certificates,
  featuredTitles,
  badges,
  onClose,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const approvedSubmissions = submissions.filter((s) => s.status === 'approved');
  
  const publicationsCount = approvedSubmissions.filter((s) => s.category === 'publication').length;
  const awardsCount = approvedSubmissions.filter((s) => ['award', 'competition', 'college_program', 'outside_program'].includes(s.category)).length;

  const myBadges = badges.filter(b => b.assignedStudentIds.includes(student.id) && b.isActive);
  const myFeatured = featuredTitles.filter(t => t.studentId === student.id && t.isActive);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="overflow-y-auto">
            {/* Header/Banner Section */}
            <div className="relative pt-12 pb-8 px-6 sm:px-10 bg-gradient-to-br from-slate-100 to-blue-50 border-b border-slate-200">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>
              
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-3xl blur opacity-30" />
                  <img
                    src={student.avatarUrl || 'https://via.placeholder.com/150'}
                    alt={student.name}
                    className="relative w-full h-full object-cover rounded-3xl shadow-lg ring-4 ring-white"
                  />
                  {student.rank && student.rank <= 3 && (
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {student.name}
                    </h2>
                    {student.rank === 1 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-widest border border-yellow-200">
                        <Star className="w-3.5 h-3.5" /> Rank 1 Scholar
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 text-sm font-medium text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      {student.course}
                    </div>
                    {student.department && student.department !== 'No-Department' && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        {student.department}
                      </div>
                    )}
                  </div>

                  {student.publicBio && (
                    <p className="text-slate-600 leading-relaxed text-sm max-w-2xl mx-auto sm:mx-0">
                      {student.publicBio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100 divide-x divide-slate-100">
              <div className="p-6 text-center bg-white">
                <div className="text-3xl font-black text-blue-600">{student.totalPoints}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Points</div>
              </div>
              <div className="p-6 text-center bg-white">
                <div className="text-3xl font-black text-indigo-600">{approvedSubmissions.length}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Activities</div>
              </div>
              <div className="p-6 text-center bg-white">
                <div className="text-3xl font-black text-emerald-600">{publicationsCount}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Publications</div>
              </div>
              <div className="p-6 text-center bg-white">
                <div className="text-3xl font-black text-amber-600">{awardsCount}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Awards & Honors</div>
              </div>
            </div>

            <div className="p-6 sm:p-10 bg-slate-50 space-y-10">
              
              {/* Badges & Titles */}
              {(myBadges.length > 0 || myFeatured.length > 0) && (
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-indigo-500" />
                    Honors & Badges
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {myFeatured.map(title => (
                      <div key={title.id} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-900 rounded-xl font-semibold shadow-sm">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        {title.title}
                      </div>
                    ))}
                    {myBadges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium shadow-sm">
                        <Award className="w-4 h-4" style={{ color: badge.color }} />
                        {badge.name}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Verified Achievements List */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Recent Verified Achievements
                </h3>
                {approvedSubmissions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {approvedSubmissions.slice(0, 10).map((sub) => (
                      <div key={sub.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 line-clamp-2 text-sm leading-tight">{sub.title}</h4>
                          <span className="shrink-0 ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                            +{sub.awardedPoints}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-500 capitalize">{sub.category.replace('_', ' ')}</span>
                          <span className="text-slate-400">{new Date(sub.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <p className="text-slate-500">No verified achievements to display yet.</p>
                  </div>
                )}
              </section>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
