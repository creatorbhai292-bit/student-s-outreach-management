/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { fileToBase64 } from '../lib/db';
import { fireScholarCelebration, fireConfetti } from '../lib/confetti';
import {
  GraduationCap,
  X,
  Search,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  MapPin,
  UserPlus,
  Sparkles,
  Upload,
  Camera,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  Building2,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  PartyPopper,
} from 'lucide-react';

const SCHOLAR_PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
];

const POPULAR_COURSES = [
  'B.Tech Computer Science & AI',
  'B.Sc. Biotechnology',
  'B.A. English Literature',
  'M.A. Urdu & Comparative Literature',
  'B.Com Honours',
  'B.Sc. Mathematics & Statistics',
  'B.A. Journalism & Mass Comm',
  'B.Sc. Physics',
];

const POPULAR_DEPARTMENTS = [
  'Computer Science & AI',
  'Biotechnology & Life Sciences',
  'Humanities & Languages',
  'Islamic Theology & Sharia',
  'Commerce & Finance',
  'Physical & Mathematical Sciences',
];

const POPULAR_CITIES = [
  'Kishanganj, Bihar',
  'Patna, Bihar',
  'Araria, Bihar',
  'Purnea, Bihar',
  'Katihar, Bihar',
  'Darbhanga, Bihar',
  'Gaya, Bihar',
  'Bhagalpur, Bihar',
];

type ModalViewMode = 'list' | 'verify' | 'create' | 'created_success';

export const StudentLoginModal: React.FC = () => {
  const {
    showStudentLoginModal,
    setShowStudentLoginModal,
    students,
    loginAsStudent,
    addStudent,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<ModalViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enteredAdmissionNo, setEnteredAdmissionNo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Student Creation State
  const [newName, setNewName] = useState('');
  const [newAdmissionNo, setNewAdmissionNo] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newBatch, setNewBatch] = useState('2024-2028');
  const [newAddress, setNewAddress] = useState('Kishanganj, Bihar');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState(SCHOLAR_PRESET_AVATARS[0]);
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [isSavingNewStudent, setIsSavingNewStudent] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [copiedAdmNo, setCopiedAdmNo] = useState(false);

  // Suggested next admission number
  const generateSuggestedAdmNo = () => {
    const nextNum = students.length + 1;
    return `ADM2026-${String(nextNum).padStart(3, '0')}`;
  };

  const resetCreateForm = () => {
    setNewName('');
    setNewAdmissionNo(generateSuggestedAdmNo());
    setNewCourse('');
    setNewDepartment('');
    setNewBatch('2024-2028');
    setNewAddress('Kishanganj, Bihar');
    setNewEmail('');
    setNewPhone('');
    setNewBio('');
    setNewAvatar(SCHOLAR_PRESET_AVATARS[Math.floor(Math.random() * SCHOLAR_PRESET_AVATARS.length)]);
    setIsPublicProfile(true);
    setErrorMsg('');
  };

  const handleOpenCreateModal = () => {
    resetCreateForm();
    setMode('create');
  };

  // Trigger celebration confetti whenever a student profile is created successfully
  useEffect(() => {
    if (mode === 'created_success' && createdStudent) {
      fireScholarCelebration();
    }
  }, [mode, createdStudent]);

  if (!showStudentLoginModal) return null;

  const activeStudents = students.filter((s) => s.isActive);
  const filteredStudents = activeStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectStudent = (std: Student) => {
    setSelectedStudent(std);
    setEnteredAdmissionNo('');
    setErrorMsg('');
    setMode('verify');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setEnteredAdmissionNo('');
    setErrorMsg('');
    setMode('list');
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setErrorMsg('');
    setIsSubmitting(true);

    const cleanInput = enteredAdmissionNo.trim().toUpperCase();
    const cleanTarget = selectedStudent.admissionNumber.trim().toUpperCase();

    setTimeout(() => {
      setIsSubmitting(false);
      // Security Check: Must strictly match the selected student's admission number!
      if (cleanInput !== cleanTarget) {
        setErrorMsg(
          `Security verification failed: Admission number does not match ${selectedStudent.name}'s institutional record.`
        );
        return;
      }

      const success = loginAsStudent(cleanInput, selectedStudent);
      if (success) {
        setShowStudentLoginModal(false);
        setSelectedStudent(null);
        setEnteredAdmissionNo('');
        setMode('list');
      } else {
        setErrorMsg('Authentication error. Account may be inactive.');
      }
    }, 250);
  };

  // Avatar upload handler for Create Form
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB. Please choose a smaller image.', 'error');
        return;
      }
      try {
        const b64 = await fileToBase64(file);
        setNewAvatar(b64);
        showToast('Photo uploaded and ready!', 'success');
      } catch (err) {
        showToast('Failed to read image file.', 'error');
      }
    }
  };

  // Handle Form Submission for Creating a New Student
  const handleCreateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim()) {
      setErrorMsg('Full Student Name is required.');
      return;
    }

    const cleanAdmNo = (newAdmissionNo.trim() || generateSuggestedAdmNo()).toUpperCase();

    // Check if admission number already exists
    const duplicate = students.some(
      (s) => s.admissionNumber.trim().toUpperCase() === cleanAdmNo
    );
    if (duplicate) {
      setErrorMsg(`Admission number "${cleanAdmNo}" already exists in the system. Please use a unique ID.`);
      return;
    }

    if (!newCourse.trim()) {
      setErrorMsg('Academic Course / Degree is required.');
      return;
    }

    if (!newDepartment.trim()) {
      setErrorMsg('Academic Department is required.');
      return;
    }

    try {
      setIsSavingNewStudent(true);

      const studentPayload = {
        name: newName.trim(),
        admissionNumber: cleanAdmNo,
        course: newCourse.trim(),
        department: newDepartment.trim(),
        batch: newBatch.trim() || '2024-2028',
        address: newAddress.trim() || 'Kishanganj, Bihar',
        email: newEmail.trim() || `${newName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'scholar'}@darulhuda.edu`,
        phone: newPhone.trim(),
        bio: newBio.trim() || `Scholar in ${newCourse.trim()} at Darul Huda Islamic University.`,
        avatarUrl: newAvatar || SCHOLAR_PRESET_AVATARS[0],
        isActive: true,
        isPublicProfileEnabled: isPublicProfile,
        publicBio: newBio.trim(),
      };

      const result = await addStudent(studentPayload);
      setCreatedStudent(result);
      setMode('created_success');
      fireScholarCelebration();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create new student profile.');
    } finally {
      setIsSavingNewStudent(false);
    }
  };

  const handleCopyAdmissionNo = (admNo: string) => {
    navigator.clipboard.writeText(admNo);
    setCopiedAdmNo(true);
    setTimeout(() => setCopiedAdmNo(false), 2000);
    showToast('Admission Number copied to clipboard!', 'success');
  };

  const handleImmediateLogin = (studentToLogin: Student) => {
    const success = loginAsStudent(studentToLogin.admissionNumber, studentToLogin);
    if (success) {
      setShowStudentLoginModal(false);
      setMode('list');
      setCreatedStudent(null);
      fireConfetti();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="student-login-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 sm:p-6 text-white relative shrink-0">
          <button
            id="close-student-modal-btn"
            onClick={() => {
              setShowStudentLoginModal(false);
              setSelectedStudent(null);
              setMode('list');
            }}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              {mode === 'create' ? (
                <UserPlus className="w-6 h-6 text-amber-300" />
              ) : mode === 'created_success' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">
                  {mode === 'create'
                    ? 'Register New Student Profile'
                    : mode === 'created_success'
                    ? 'Scholar Profile Created!'
                    : 'Student Identity Portal'}
                </h3>
                {mode === 'create' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Instant Live Sync
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                {mode === 'create'
                  ? 'Fill details & upload student photo to create permanent institutional profile'
                  : mode === 'created_success'
                  ? 'Your profile is now live in Admin Panel & Student Login list'
                  : mode === 'verify' && selectedStudent
                  ? `Verify Admission Number for ${selectedStudent.name}`
                  : 'Select your student profile to authenticate or enroll as a new scholar'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body with Animated Modes */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------------- */}
            {/* MODE 1: Student Selection List & Create New Prompt */}
            {/* ---------------------------------------------------- */}
            {mode === 'list' && (
              <motion.div
                key="list-mode"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Search Bar & Standout Animated "CREATE NEW" Action Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="student-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, course, city..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* DYNAMIC & ANIMATED "CREATE NEW" BUTTON */}
                  <motion.button
                    id="create-student-top-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCreateModal}
                    className="relative group overflow-hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/80 shrink-0"
                  >
                    {/* Shimmer light effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                    
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                    </motion.div>
                    <span>+ Create New Profile</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Enroll
                    </span>
                  </motion.button>
                </div>

                {/* Counts / Active Indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                  <span>
                    Showing <strong className="text-slate-800">{filteredStudents.length}</strong> registered students
                  </span>
                  <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    IndexedDB Real Storage
                  </span>
                </div>

                {/* Student Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto p-1">
                  
                  {/* Dynamic Animated "CREATE NEW SCHOLAR" Tile inside grid */}
                  <motion.div
                    id="create-student-card-btn"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenCreateModal}
                    className="relative overflow-hidden flex items-center gap-3.5 p-3.5 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-100/40 hover:bg-amber-100/60 hover:shadow-md transition-all cursor-pointer text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-900">
                          + Create New Profile
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black uppercase">
                          New
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">Enroll new scholar identity</p>
                      <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5 truncate">
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Upload photo, city & get admission ID</span>
                      </p>
                    </div>
                  </motion.div>

                  {/* Existing & Filtered Students */}
                  {filteredStudents.map((std) => (
                    <motion.div
                      key={std.id}
                      id={`student-card-${std.id}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectStudent(std)}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs transition-all cursor-pointer text-left group"
                    >
                      <img
                        src={std.avatarUrl}
                        alt={std.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-400 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700">
                            {std.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {std.admissionNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{std.course}</p>
                        {std.address ? (
                          <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>{std.address}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 truncate">{std.department}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                    <p className="text-sm text-slate-500">
                      No active students found matching "{searchQuery}".
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create Student Profile for "{searchQuery}"
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 2: Verification Screen for Existing Student */}
            {/* ---------------------------------------------------- */}
            {mode === 'verify' && selectedStudent && (
              <motion.div
                key="verify-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="max-w-md mx-auto space-y-5"
              >
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Select different student
                </button>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-bold text-slate-900">{selectedStudent.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{selectedStudent.course}</p>
                    <p className="text-[11px] text-slate-500">{selectedStudent.department}</p>
                    {selectedStudent.address && (
                      <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Address: {selectedStudent.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        Enter Your Admission Number
                      </span>
                      <span className="text-[11px] text-blue-600 font-normal">
                        Hint: {selectedStudent.admissionNumber}
                      </span>
                    </label>
                    <input
                      id="student-admission-input"
                      type="text"
                      required
                      autoFocus
                      value={enteredAdmissionNo}
                      onChange={(e) => setEnteredAdmissionNo(e.target.value)}
                      placeholder="e.g. ADM2026-001"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono uppercase text-slate-900 tracking-wider placeholder-slate-400"
                    />
                    <p className="text-[11px] text-slate-500">
                      To maintain privacy, each student account is secured with its unique institutional admission code.
                    </p>
                  </div>

                  <button
                    id="student-auth-submit-btn"
                    type="submit"
                    disabled={isSubmitting || !enteredAdmissionNo.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isSubmitting ? 'Authenticating...' : 'Access My Student Portal'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 3: CREATE NEW STUDENT PROFILE (Animated, Rich Form) */}
            {/* ---------------------------------------------------- */}
            {mode === 'create' && (
              <motion.div
                key="create-mode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Back Button & Intro Banner */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Students List
                  </button>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Profile will instantly show in Admin Panel & Student Login
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form id="create-student-form" onSubmit={handleCreateStudentSubmit} className="space-y-6 text-xs">
                  
                  {/* Photo Upload & Preview Section */}
                  <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-700" />
                        Student Profile Photo (Real Upload or Presets)
                      </span>
                      <span className="text-[11px] text-slate-500">Max 5MB • PNG, JPG, WEBP</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Avatar Preview */}
                      <div className="relative shrink-0">
                        <img
                          src={newAvatar || SCHOLAR_PRESET_AVATARS[0]}
                          alt="New Student Avatar"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-400 shadow-md bg-white"
                        />
                        <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md shadow-xs uppercase tracking-wider">
                          PHOTO
                        </span>
                      </div>

                      {/* Upload Buttons & Options */}
                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor="new-student-avatar-file-input"
                            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload from Device</span>
                          </label>
                          <input
                            type="file"
                            id="new-student-avatar-file-input"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFileUpload}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setNewAvatar(
                                SCHOLAR_PRESET_AVATARS[Math.floor(Math.random() * SCHOLAR_PRESET_AVATARS.length)]
                              )
                            }
                            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Random Preset</span>
                          </button>
                        </div>

                        {/* Web Image URL */}
                        <div>
                          <input
                            type="url"
                            value={newAvatar}
                            onChange={(e) => setNewAvatar(e.target.value)}
                            placeholder="Or paste an image web link (https://...)"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        {/* Quick Presets Picker */}
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Or pick scholar portrait:
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {SCHOLAR_PRESET_AVATARS.map((presetUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setNewAvatar(presetUrl)}
                                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer shrink-0 ${
                                  newAvatar === presetUrl
                                    ? 'border-amber-500 ring-2 ring-amber-400'
                                    : 'border-slate-200'
                                }`}
                                title={`Preset ${idx + 1}`}
                              >
                                <img src={presetUrl} alt="preset" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal & Academic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span>Full Student Name *</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Required</span>
                      </label>
                      <input
                        id="new-student-name-input"
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Mohammad Bilal / Farhan Raza"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Admission Number */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span>Admission Number / Roll ID *</span>
                        <span className="text-[10px] text-slate-400 font-mono">Unique Key</span>
                      </label>
                      <div className="relative">
                        <input
                          id="new-student-adm-input"
                          type="text"
                          required
                          value={newAdmissionNo}
                          onChange={(e) => setNewAdmissionNo(e.target.value.toUpperCase())}
                          placeholder="e.g. ADM2026-012"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setNewAdmissionNo(generateSuggestedAdmNo())}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                          title="Auto-generate next ID"
                        >
                          Auto ID
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">Used as security password to authenticate into portal.</p>
                    </div>

                    {/* Course */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          Academic Course / Degree *
                        </span>
                      </label>
                      <input
                        id="new-student-course-input"
                        type="text"
                        required
                        value={newCourse}
                        onChange={(e) => setNewCourse(e.target.value)}
                        placeholder="e.g. B.Tech Computer Science & AI"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {/* Popular course chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {POPULAR_COURSES.slice(0, 4).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCourse(c)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 text-[10px] font-medium transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          Academic Department *
                        </span>
                      </label>
                      <input
                        id="new-student-dept-input"
                        type="text"
                        required
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & AI"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {/* Popular department chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {POPULAR_DEPARTMENTS.slice(0, 3).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setNewDepartment(d)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-[10px] font-medium transition-colors"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address / Hometown */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-amber-800">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          Hometown / Residential Address (Prominently displayed) *
                        </span>
                        <span className="text-[10px] text-slate-400">e.g. Kishanganj, Bihar</span>
                      </label>
                      <input
                        id="new-student-address-input"
                        type="text"
                        required
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="e.g. Kishanganj, Bihar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {/* Popular city chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {POPULAR_CITIES.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setNewAddress(city)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              newAddress === city
                                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Batch */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Academic Batch</span>
                      </label>
                      <input
                        type="text"
                        value={newBatch}
                        onChange={(e) => setNewBatch(e.target.value)}
                        placeholder="e.g. 2024-2028"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. scholar@darulhuda.edu"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Phone / WhatsApp Number</span>
                      </label>
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-800 text-xs">
                        Personal Academic Bio / Scholar Statement
                      </label>
                      <textarea
                        rows={2}
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        placeholder="Brief summary of scholarly pursuits, academic goals, or achievements..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Public Profile Checkbox */}
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="new-public-profile-toggle"
                        checked={isPublicProfile}
                        onChange={(e) => setIsPublicProfile(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="new-public-profile-toggle" className="text-xs text-slate-700 cursor-pointer select-none">
                        <strong className="text-slate-900 block">Enable Public Scholar Profile</strong>
                        Display scholar achievements, rank, and portfolio on the public university leaderboard.
                      </label>
                    </div>

                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      id="new-student-submit-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSavingNewStudent}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingNewStudent ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Institutional Profile...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Create Student Profile & Enroll Now</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* MODE 4: CREATION SUCCESS CELEBRATION */}
            {/* ---------------------------------------------------- */}
            {mode === 'created_success' && createdStudent && (
              <motion.div
                key="success-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-lg mx-auto py-2 space-y-6 text-center"
              >
                {/* Success Icon */}
                <div className="relative inline-block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-400 pointer-events-none"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Student Profile Created Successfully!</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    The student has been enrolled into Darul Huda Islamic University's live persistent records.
                  </p>
                </div>

                {/* Digital Identity Card Preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl text-left relative overflow-hidden border border-indigo-800/80">
                  {/* Watermark Logo / Badge */}
                  <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                    <GraduationCap className="w-48 h-48 text-white" />
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={createdStudent.avatarUrl}
                      alt={createdStudent.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                          Active Scholar
                        </span>
                        <span className="text-[11px] text-blue-200">Darul Huda</span>
                        <button
                          type="button"
                          onClick={() => fireScholarCelebration()}
                          className="ml-auto px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                          title="Click to celebrate with confetti!"
                        >
                          <PartyPopper className="w-3 h-3 text-amber-300 animate-bounce" />
                          <span>Confetti 🎉</span>
                        </button>
                      </div>
                      <h4 className="text-lg font-black text-white truncate">{createdStudent.name}</h4>
                      <p className="text-xs text-blue-200 font-medium truncate">{createdStudent.course}</p>
                      {createdStudent.address && (
                        <p className="text-xs text-amber-300 font-semibold flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{createdStudent.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admission Code Highlight with Copy button */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-blue-300 uppercase tracking-wider font-bold block">
                        Official Admission Code (Login Password)
                      </span>
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                        {createdStudent.admissionNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyAdmissionNo(createdStudent.admissionNumber)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedAdmNo ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-300" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Where it is visible */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Synchronized Everywhere:
                  </p>
                  <ul className="list-disc list-inside text-blue-800 space-y-0.5 text-[11px]">
                    <li><strong>Admin Panel:</strong> Instantly listed in Student Accounts, Statistics & Certificates.</li>
                    <li><strong>Student Login Portal:</strong> Listed for all future logins with avatar & details.</li>
                  </ul>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
                  <motion.button
                    id="success-login-now-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleImmediateLogin(createdStudent)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Login Immediately as {createdStudent.name}</span>
                  </motion.button>

                  <button
                    id="success-back-to-list-btn"
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setCreatedStudent(null);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View in All Students List
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
