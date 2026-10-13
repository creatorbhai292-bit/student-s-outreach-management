import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, ActivitySubmission, AchievementBadge, FeaturedStudentTitle } from '../types';
import { Search, Edit, X, Save, Check, Globe, EyeOff, Camera, Award } from 'lucide-react';

interface Props {
  students: Student[];
  updateStudent: (s: Student) => Promise<void>;
  badges: AchievementBadge[];
  featuredTitles: FeaturedStudentTitle[];
}

export const AdminPublicProfilesTab: React.FC<Props> = ({ students, updateStudent, badges, featuredTitles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  // Edit State
  const [publicBio, setPublicBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const rankA = a.rank ?? 9999;
      const rankB = b.rank ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return a.admissionNumber.localeCompare(b.admissionNumber);
    });
  }, [students]);

  const filteredStudents = sortedStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setPublicBio(student.publicBio || '');
    setAvatarUrl(student.avatarUrl || '');
    setIsPublic(student.isPublicProfileEnabled || false);
  };

  const handleSave = async (student: Student) => {
    await updateStudent({
      ...student,
      publicBio,
      avatarUrl,
      isPublicProfileEnabled: isPublic,
    });
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Public Student Profiles</h1>
          <p className="text-xs text-slate-500 mt-1">Manage public visibility, biographies, and avatars for the public achievement gallery.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search by name or admission number..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredStudents.map((student) => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              key={student.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {editingStudentId === student.id ? (
                <div className="p-4 space-y-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">Editing: {student.name}</h3>
                    <button onClick={() => setEditingStudentId(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Avatar URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Public Bio</label>
                    <textarea
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm h-20 resize-none"
                      value={publicBio}
                      onChange={(e) => setPublicBio(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Enable Public Profile</span>
                    </label>
                  </div>
                  <button
                    onClick={() => handleSave(student)}
                    className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save Profile
                  </button>
                </div>
              ) : (
                <div className="p-4 flex gap-4 items-start">
                  <img
                    src={student.avatarUrl || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{student.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{student.course}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${student.isPublicProfileEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {student.isPublicProfileEnabled ? 'Public' : 'Hidden'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                        {student.totalPoints} pts
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditClick(student)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
