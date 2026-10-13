/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ActivitySubmission, ActivityCategory, SubmissionStatus } from '../types';
import { exportStudentReportPDF, exportCertificatePDF } from '../lib/pdfExport';
import { exportStudentDataExcel } from '../lib/excelExport';
import { fileToBase64 } from '../lib/db';
import { fireCertificateCelebration } from '../lib/confetti';
import {
  GraduationCap,
  Trophy,
  Award,
  BookOpen,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  ExternalLink,
  Download,
  QrCode,
  ShieldCheck,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Camera,
  UserCheck,
  User,
  X,
  RotateCcw,
  Layers,
  MapPin,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    currentStudent,
    submissions,
    pointRules,
    pointHistory,
    certificates,
    badges,
    notifications,
    settings,
    submitActivity,
    updateActivity,
    deleteActivity,
    updateStudent,
    markNotificationRead,
    showToast,
    setVerificationCertId,
  } = useApp();

  // If no student is logged in
  if (!currentStudent) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <GraduationCap className="w-12 h-12 text-blue-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Student Login Required</h3>
        <p className="text-xs text-slate-500">Please sign in through the Student Login portal to access your dashboard.</p>
      </div>
    );
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Student Profile Edit State
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editCourse, setEditCourse] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editBatch, setEditBatch] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Student's own private data
  const mySubmissions = submissions.filter((s) => s.studentId === currentStudent.id);
  const myApproved = mySubmissions.filter((s) => s.status === 'approved');
  const myPending = mySubmissions.filter((s) => s.status === 'pending');
  const myRejected = mySubmissions.filter((s) => s.status === 'rejected');
  const myCorrections = mySubmissions.filter((s) => s.status === 'correction_requested');
  const myDrafts = mySubmissions.filter((s) => s.status === 'draft');

  const myHistory = pointHistory.filter((ph) => ph.studentId === currentStudent.id);
  const myCertificates = certificates.filter((c) => c.studentId === currentStudent.id);
  const myBadges = badges.filter((b) => b.assignedStudentIds.includes(currentStudent.id));
  const myNotifications = notifications.filter(
    (n) => n.recipientRole === 'student' && (!n.studentId || n.studentId === currentStudent.id)
  );

  // Category Tab state for student's point ledger
  const [historyCategoryTab, setHistoryCategoryTab] = useState<string>('all');

  const studentLedgerCategories = useMemo(() => {
    const catsSet = new Set<string>();
    myHistory.forEach((h) => {
      if (h.category) catsSet.add(h.category);
    });
    mySubmissions.forEach((s) => {
      if (s.category) catsSet.add(s.category);
    });

    const categoryList = Array.from(catsSet).map((key) => {
      const records = myHistory.filter((h) => h.category === key);
      const points = records.reduce((sum, r) => sum + (r.pointsAdded || 0), 0);
      const label = key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return {
        key,
        label,
        count: records.length,
        points,
      };
    });

    return categoryList;
  }, [myHistory, mySubmissions]);

  const filteredMyHistory = useMemo(() => {
    if (historyCategoryTab === 'all') return myHistory;
    return myHistory.filter((h) => h.category === historyCategoryTab);
  }, [myHistory, historyCategoryTab]);

  // Form State for Submission
  const [formCategory, setFormCategory] = useState<ActivityCategory>('publication');
  const [formSubType, setFormSubType] = useState<string>('Article');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formRank, setFormRank] = useState('Participation');
  const [formImageBase64, setFormImageBase64] = useState<string>('');
  const [formDocBase64, setFormDocBase64] = useState<string>('');
  const [formDocName, setFormDocName] = useState<string>('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Handle File uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit.', 'error');
        return;
      }
      const b64 = await fileToBase64(file);
      setFormImageBase64(b64);
      showToast('Image attached successfully.', 'info');
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        showToast('File size exceeds 8MB limit.', 'error');
        return;
      }
      const b64 = await fileToBase64(file);
      setFormDocBase64(b64);
      setFormDocName(file.name);
      showToast('Supporting document attached.', 'info');
    }
  };

  const resetForm = () => {
    setEditingSubId(null);
    setFormTitle('');
    setFormDescription('');
    setFormVenue('');
    setFormLink('');
    setFormImageBase64('');
    setFormDocBase64('');
    setFormDocName('');
  };

  const handleFormSubmit = async (asDraft: boolean = false) => {
    if (!formTitle.trim()) {
      showToast('Please provide an activity title.', 'error');
      return;
    }

    // Match recommended points
    const matchedRule = pointRules.find(
      (r) => r.category === formCategory && r.activityType.toLowerCase() === formSubType.toLowerCase()
    );
    const recPoints = matchedRule ? matchedRule.recommendedPoints : 10;

    if (editingSubId) {
      const existing = mySubmissions.find((s) => s.id === editingSubId);
      if (existing) {
        await updateActivity({
          ...existing,
          category: formCategory,
          subType: formSubType,
          title: formTitle,
          date: formDate,
          description: formDescription,
          venueOrOrganizer: formVenue,
          externalLink: formLink,
          participationRank: formRank,
          imageUrl: formImageBase64 || existing.imageUrl,
          supportingDocUrl: formDocBase64 || existing.supportingDocUrl,
          supportingDocName: formDocName || existing.supportingDocName,
          status: asDraft ? 'draft' : 'pending',
          recommendedPoints: recPoints,
        });
      }
    } else {
      await submitActivity(
        {
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          studentAdmissionNo: currentStudent.admissionNumber,
          studentCourse: currentStudent.course,
          studentDepartment: currentStudent.department,
          category: formCategory,
          subType: formSubType,
          title: formTitle,
          date: formDate,
          description: formDescription,
          venueOrOrganizer: formVenue,
          externalLink: formLink,
          participationRank: formRank,
          imageUrl: formImageBase64,
          supportingDocUrl: formDocBase64,
          supportingDocName: formDocName,
          recommendedPoints: recPoints,
        },
        asDraft
      );
    }

    resetForm();
    setActiveTab('my-activities');
  };

  const handleEditSubmission = (sub: ActivitySubmission) => {
    setEditingSubId(sub.id);
    setFormCategory(sub.category);
    setFormSubType(sub.subType || 'Article');
    setFormTitle(sub.title);
    setFormDate(sub.date);
    setFormDescription(sub.description);
    setFormVenue(sub.venueOrOrganizer || '');
    setFormLink(sub.externalLink || '');
    setFormRank(sub.participationRank || 'Participation');
    setFormImageBase64(sub.imageUrl || '');
    setFormDocBase64(sub.supportingDocUrl || '');
    setFormDocName(sub.supportingDocName || '');
    setActiveTab('submit');
  };

  // Open Profile Edit Modal with pre-filled current student data
  const handleOpenEditProfile = () => {
    setEditName(currentStudent.name || '');
    setEditPhone(currentStudent.phone || '');
    setEditEmail(currentStudent.email || '');
    setEditAddress(currentStudent.address || '');
    setEditCourse(currentStudent.course || '');
    setEditDepartment(currentStudent.department || '');
    setEditBatch(currentStudent.batch || '');
    setEditBio(currentStudent.bio || '');
    setEditAvatar(currentStudent.avatarUrl || '');
    setShowEditProfileModal(true);
  };

  // Avatar file upload from within the modal
  const handleAvatarModalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image exceeds 5MB. Please choose a smaller image file.', 'error');
        return;
      }
      try {
        const b64 = await fileToBase64(file);
        setEditAvatar(b64);
        showToast('New profile photo loaded. Click "Save Profile Changes" to store permanently in real data.', 'info');
      } catch (err) {
        showToast('Failed to convert image file.', 'error');
      }
    }
  };

  // Direct 1-click avatar upload directly from the banner
  const handleDirectBannerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image exceeds 5MB. Please choose a smaller image file.', 'error');
        return;
      }
      try {
        const b64 = await fileToBase64(file);
        const updated = {
          ...currentStudent,
          avatarUrl: b64,
        };
        await updateStudent(updated);
        showToast('Profile photo updated and saved to real data!', 'success');
      } catch (err) {
        showToast('Failed to save profile photo.', 'error');
      }
    }
  };

  // Save full profile changes to real persistent database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Student name is required.', 'error');
      return;
    }
    try {
      setIsSavingProfile(true);
      const updated = {
        ...currentStudent,
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        course: editCourse.trim(),
        department: editDepartment.trim(),
        batch: editBatch.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatar.trim() || currentStudent.avatarUrl,
      };
      await updateStudent(updated);
      setShowEditProfileModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Curated preset scholar avatars for quick selection (Muslim boys portraits)
  const PRESET_AVATARS = [
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. STUDENT WELCOME BANNER WITH DIRECT AVATAR EDIT & EDIT PROFILE BUTTON */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Interactive Avatar with Quick Photo Upload Badge */}
            <div className="relative group">
              <input
                type="file"
                id="banner-avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleDirectBannerAvatarUpload}
              />
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-300 shadow-md transition-all group-hover:brightness-90"
              />
              <label
                htmlFor="banner-avatar-upload"
                title="Click to quickly upload new photo from your device"
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Camera className="w-5 h-5 text-amber-300 drop-shadow-sm" />
                <span className="text-[10px] font-bold mt-0.5 tracking-tight text-center px-1">Upload Photo</span>
              </label>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                title="Open Profile Editor"
                className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md transition-transform hover:scale-110 cursor-pointer"
              >
                <Edit3 className="w-3 h-3 font-bold" />
              </button>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md shadow-xs">
                #{currentStudent.rank || 1}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentStudent.name}</h1>
                <button
                  onClick={handleOpenEditProfile}
                  title="Click to edit profile info"
                  className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-amber-300 hover:text-amber-200 text-[11px] font-bold border border-white/20 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 hidden sm:inline-block">
                  Active Scholar
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 font-medium">
                {currentStudent.admissionNumber} • {currentStudent.course}
              </p>
              <p className="text-xs text-slate-300">
                {currentStudent.department} • Batch of {currentStudent.batch}
              </p>
              {currentStudent.address && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 w-fit mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Address: {currentStudent.address}</span>
                </div>
              )}
              {currentStudent.bio && (
                <p className="text-xs text-amber-200/90 italic line-clamp-1 max-w-lg mt-0.5">
                  "{currentStudent.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Points & CTAs (Edit Profile + Download Dossier PDF) */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-center flex-1 sm:flex-initial min-w-[110px]">
              <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block">Merit Points</span>
              <span className="text-2xl font-black text-amber-300">{currentStudent.totalPoints}</span>
            </div>

            {/* EDIT PROFILE BUTTON */}
            <button
              id="student-edit-profile-btn"
              onClick={handleOpenEditProfile}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:shadow-xl active:scale-98"
              title="Edit student profile data and profile photo"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Edit Profile & Photo</span>
            </button>

            <button
              id="student-download-pdf-btn"
              onClick={() =>
                exportStudentReportPDF(
                  currentStudent,
                  mySubmissions,
                  myHistory,
                  settings.organizationName,
                  settings.logoUrl
                )
              }
              className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-colors"
              title="Download Official Dossier PDF"
            >
              <Download className="w-4 h-4" />
              Download Dossier PDF
            </button>
          </div>

        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-blue-700">{currentStudent.totalPoints}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Total Points</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-amber-600">#{currentStudent.rank || '-'}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Campus Rank</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-emerald-600">{myApproved.length}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Approved</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-amber-500">{myPending.length}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Pending</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-rose-500">{myRejected.length + myCorrections.length}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Action Needed</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center">
          <p className="text-2xl font-black text-slate-600">{myDrafts.length}</p>
          <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Saved Drafts</p>
        </div>
      </div>

      {/* 3. PORTAL NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'submit', label: editingSubId ? 'Edit Submission' : 'Submit Activity', icon: PlusCircle },
          { id: 'my-activities', label: `My Submissions (${mySubmissions.length})`, icon: FileText },
          { id: 'history', label: 'Point History', icon: TrendingUp },
          { id: 'certificates', label: `Certificates & Badges (${myCertificates.length})`, icon: Award },
          { id: 'exports', label: 'Export Data', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`student-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Activity Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                Recent Activity Timeline
              </h3>

              <div className="space-y-4">
                {mySubmissions.slice(0, 6).map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="mt-0.5">
                      {sub.status === 'approved' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : sub.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-amber-500" />
                      ) : sub.status === 'correction_requested' ? (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      ) : sub.status === 'rejected' ? (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{sub.title}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">{sub.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sub.category.replace('_', ' ').toUpperCase()} • {sub.subType || '-'}
                      </p>
                      {sub.adminReviewNote && (
                        <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                          <span className="font-semibold">Review Feedback:</span> {sub.adminReviewNote}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        sub.status === 'correction_requested' ? 'bg-orange-100 text-orange-800' :
                        sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-800'
                      }`}>
                        {sub.status.toUpperCase().replace('_', ' ')}
                      </span>
                      {sub.awardedPoints > 0 && (
                        <span className="text-xs font-bold text-emerald-700 block mt-1">
                          +{sub.awardedPoints} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {mySubmissions.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No submissions recorded yet. Click "Submit Activity" to submit your achievements!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Notifications & Badges */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Recent Notifications</span>
                <span className="text-[11px] text-blue-600 font-medium">
                  {myNotifications.filter((n) => !n.isRead).length} New
                </span>
              </h3>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {myNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      n.isRead ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-blue-50/70 border-blue-200 text-slate-900 font-medium'
                    }`}
                  >
                    <p className="font-bold text-xs">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                ))}

                {myNotifications.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No new notifications.</p>
                )}
              </div>
            </div>

            {/* Badges Earned */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Badges Earned
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {myBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1"
                  >
                    <Sparkles className="w-5 h-5 mx-auto text-amber-500" />
                    <p className="text-xs font-bold text-slate-900 truncate">{badge.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{badge.minPointsOrCriteria}</p>
                  </div>
                ))}

                {myBadges.length === 0 && (
                  <p className="col-span-2 text-xs text-slate-400 text-center py-4">
                    Participate and publish to earn institutional achievement badges!
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUBMIT ACTIVITY (WITH DRAFT SUPPORT & FULL FIELDS) */}
      {activeTab === 'submit' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {editingSubId ? 'Edit Activity Submission' : 'Submit Activity or Academic Achievement'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your publications, research papers, symposiums, or awards for review by the institutional outreach committee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Activity Category</label>
              <select
                id="submit-category-select"
                value={formCategory}
                onChange={(e) => {
                  const cat = e.target.value as ActivityCategory;
                  setFormCategory(cat);
                  // Set sensible default subtype
                  if (cat === 'publication') setFormSubType('Article');
                  else if (cat === 'paper_presentation') setFormSubType('National Conference');
                  else if (cat === 'seminar') setFormSubType('Active Delegate');
                  else if (cat === 'college_program') setFormSubType('Debate');
                  else if (cat === 'outside_program') setFormSubType('University Youth Festival');
                  else if (cat === 'competition') setFormSubType('Hackathon / Coding Sprint');
                  else if (cat === 'award') setFormSubType('Institutional Excellence Award');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="publication">Publications</option>
                <option value="paper_presentation">Paper Presentation</option>
                <option value="seminar">Seminar / Colloquium</option>
                <option value="college_program">College Program</option>
                <option value="outside_program">Outside College Program</option>
                <option value="competition">Competition</option>
                <option value="award">Awards & Honours</option>
                <option value="other_activity">Other Outreach Activity</option>
              </select>
            </div>

            {/* Sub-type input or selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Sub-Type / Genre</label>
              {formCategory === 'publication' ? (
                <select
                  id="submit-subtype-select"
                  value={formSubType}
                  onChange={(e) => setFormSubType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Article">Article</option>
                  <option value="Ghazal">Ghazal</option>
                  <option value="Naat">Naat</option>
                  <option value="Essay">Essay</option>
                  <option value="Poem">Poem</option>
                  <option value="Story">Story</option>
                  <option value="Research Article">Research Article</option>
                  <option value="Newspaper Article">Newspaper Article</option>
                  <option value="Magazine Article">Magazine Article</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formSubType}
                  onChange={(e) => setFormSubType(e.target.value)}
                  placeholder="e.g. National Conference, Keynote, Debate..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              )}
            </div>

            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Activity / Paper / Article Title *</label>
              <input
                id="submit-title-input"
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Microbial Degradation of Microplastics..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Event / Publication Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Venue / Organizer / Journal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Newspaper / Organizer / Venue</label>
              <input
                type="text"
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                placeholder="e.g. The Literary Daily, IIT Delhi, Singapore Arena..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* External Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Original Link / DOI (Optional)</label>
              <input
                type="url"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Participation Rank / Award Position */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Rank / Award Obtained</label>
              <select
                value={formRank}
                onChange={(e) => setFormRank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="1st">1st Place (Gold)</option>
                <option value="2nd">2nd Place (Silver)</option>
                <option value="3rd">3rd Place (Bronze)</option>
                <option value="Winner">Winner / Champion</option>
                <option value="Runner Up">Runner Up</option>
                <option value="Finalist">Finalist</option>
                <option value="Special Mention">Special Mention</option>
                <option value="Participation">Participation / Presenter</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Detailed Description / Abstract</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Provide details about the presentation topic, competition rounds, or newspaper article context..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Image / Clipping Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                Upload Photo / Newspaper Clipping
              </label>
              <input
                id="submit-image-file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {formImageBase64 && (
                <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={formImageBase64} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Supporting Document / Certificate (PDF/Image)
              </label>
              <input
                id="submit-doc-file"
                type="file"
                accept=".pdf,image/*"
                onChange={handleDocUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {formDocName && <p className="text-[11px] text-emerald-600 font-medium">Attached: {formDocName}</p>}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Reset
            </button>
            <button
              id="submit-draft-btn"
              type="button"
              onClick={() => handleFormSubmit(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              id="submit-activity-btn"
              type="button"
              onClick={() => handleFormSubmit(false)}
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {editingSubId ? 'Update & Submit for Review' : 'Submit for Admin Verification'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MY SUBMISSIONS (STATUSES & RESUBMISSION) */}
      {activeTab === 'my-activities' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Submissions & Activities</h2>
              <p className="text-xs text-slate-500">Track verification status, review notes, and edit returned submissions.</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('submit');
              }}
              className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Submission
            </button>
          </div>

          <div className="space-y-4">
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  {sub.imageUrl ? (
                    <img
                      src={sub.imageUrl}
                      alt={sub.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        sub.status === 'correction_requested' ? 'bg-orange-100 text-orange-800' :
                        sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-800'
                      }`}>
                        {sub.status.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {sub.category.replace('_', ' ')} • {sub.subType || '-'}
                      </span>
                      <span className="text-[11px] text-slate-400">• {sub.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{sub.title}</h4>
                    {sub.venueOrOrganizer && (
                      <p className="text-xs text-slate-600">{sub.venueOrOrganizer}</p>
                    )}

                    {sub.adminReviewNote && (
                      <div
                        className={`p-3 rounded-2xl border text-xs mt-2.5 space-y-1 ${
                          sub.status === 'correction_requested'
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                            : sub.status === 'rejected'
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          {sub.status === 'correction_requested' && <MessageSquare className="w-3.5 h-3.5 text-amber-700" />}
                          {sub.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                          {sub.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                          <span>
                            {sub.status === 'correction_requested'
                              ? 'Admin Message / Action Required:'
                              : sub.status === 'rejected'
                              ? 'Admin Rejection Reason:'
                              : 'Admin Approval Commendation:'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed italic">
                          "{sub.adminReviewNote}"
                        </p>
                        {sub.status === 'correction_requested' && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleEditSubmission(sub)}
                              className="text-[11px] font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Click here to correct and re-submit</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {sub.awardedPoints > 0 && (
                    <div className="text-right mr-3">
                      <span className="text-base font-black text-emerald-700">+{sub.awardedPoints}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">pts awarded</span>
                    </div>
                  )}

                  {(sub.status === 'draft' || sub.status === 'correction_requested' || sub.status === 'rejected') && (
                    <button
                      onClick={() => handleEditSubmission(sub)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Edit & Resubmit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {sub.status !== 'approved' && (
                    <button
                      onClick={() => deleteActivity(sub.id)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {mySubmissions.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No submissions found. Click "New Submission" to submit your achievements!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: POINT HISTORY (COMPLETE AUDIT TRAIL) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Merit Point Ledger & Audit History</h2>
              <p className="text-xs text-slate-500">
                Immutable chronological record of all awarded points, reviewer signatures, and adjustments.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 w-fit">
              Total Points: {currentStudent.totalPoints} pts
            </span>
          </div>

          {/* Student Category Tabs */}
          {studentLedgerCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setHistoryCategoryTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                  historyCategoryTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Categories</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${historyCategoryTab === 'all' ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {myHistory.length}
                </span>
              </button>

              {studentLedgerCategories.map((cat) => {
                const isSelected = historyCategoryTab === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setHistoryCategoryTab(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20' : 'bg-slate-200'}`}>
                      {cat.count}
                    </span>
                    {cat.points > 0 && (
                      <span className={`text-[10px] font-black ${isSelected ? 'text-amber-300' : 'text-emerald-600'}`}>
                        +{cat.points} pts
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Activity Record</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Previous</th>
                  <th className="py-3 px-4">Points Added</th>
                  <th className="py-3 px-4">Final Total</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMyHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-slate-500">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">{h.activityTitle}</td>
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-500">{h.category.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-500">{h.previousPoints}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">+{h.pointsAdded}</td>
                    <td className="py-3 px-4 font-black text-blue-700">{h.finalPoints}</td>
                    <td className="py-3 px-4 text-slate-600">{h.adminName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{h.reason}</td>
                  </tr>
                ))}
                {filteredMyHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No point transactions recorded in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATES & BADGES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Official Certificates of Achievement</h2>
              <p className="text-xs text-slate-500">
                Issued with institutional cryptographic hashes and public QR code verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-blue-50/30 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-900 font-bold">{cert.id}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Verified Authentic
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{cert.activityTitle}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{cert.achievementDetails}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Issued: {cert.issueDate}</span>
                      <span className="text-xs font-bold text-blue-700">+{cert.pointsAwarded} Points Awarded</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVerificationCertId(cert.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        title="View Tamper-Proof QR Seal"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR Seal
                      </button>

                      <button
                        onClick={() => {
                          exportCertificatePDF(cert, settings.organizationName, settings.logoUrl);
                          fireCertificateCelebration();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        title="Download Certificate PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {myCertificates.length === 0 && (
                <div className="col-span-2 p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No official certificates issued yet. Certificates are conferred by the Dean upon verifying outstanding papers or awards.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EXPORT DATA */}
      {activeTab === 'exports' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Download My Academic Dossier & Data</h2>
            <p className="text-xs text-slate-500 mt-1">
              Download your verified student achievement record for higher education applications, job interviews, or scholarship dossiers.
            </p>
          </div>

          <div className="space-y-4">
            {/* PDF Report Option */}
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Official Student Achievement Dossier (PDF)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Includes institutional header, student profile summary, complete verified achievement tables, points ledger, and authentic verification QR code.
                </p>
              </div>
              <button
                onClick={() =>
                  exportStudentReportPDF(
                    currentStudent,
                    mySubmissions,
                    myHistory,
                    settings.organizationName,
                    settings.logoUrl
                  )
                }
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                Export PDF
              </button>
            </div>

            {/* Excel Data Option */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700" />
                  Raw Activity Ledger (Excel Spreadsheet)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exports multi-sheet Excel file (.xlsx) containing My Profile, My Submissions, and Points Audit History strictly for your personal records.
                </p>
              </div>
              <button
                onClick={() => exportStudentDataExcel(currentStudent, mySubmissions, myHistory)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT PROFILE & PHOTO */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Real Data Management
                </span>
                <span className="text-blue-200 text-xs font-mono">{currentStudent.admissionNumber}</span>
              </div>
              <h3 className="text-xl font-black text-white">Edit Student Profile & Photo</h3>
              <p className="text-xs text-blue-200 mt-1">
                All changes and uploaded photos are saved directly into real persistent data across the portal.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Photo Upload & Preview Section */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-700" />
                    Student Profile Photo (Real Upload)
                  </span>
                  <span className="text-[11px] text-slate-500">Max 5MB • PNG, JPG, WEBP</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    <img
                      src={editAvatar || currentStudent.avatarUrl}
                      alt="Avatar Preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-400 shadow-md bg-white"
                    />
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md shadow-xs">
                      PREVIEW
                    </span>
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="modal-avatar-file-input"
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Device</span>
                      </label>
                      <input
                        type="file"
                        id="modal-avatar-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarModalUpload}
                      />

                      <button
                        type="button"
                        onClick={() => setEditAvatar(currentStudent.avatarUrl)}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>

                    {/* Or URL Input */}
                    <div>
                      <input
                        type="url"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="Or paste an image web link (https://...)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    {/* Quick Preset Avatars */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Or pick a scholar avatar preset:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {PRESET_AVATARS.map((presetUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditAvatar(presetUrl)}
                            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer shrink-0 ${
                              editAvatar === presetUrl ? 'border-amber-500 ring-2 ring-amber-400' : 'border-slate-200'
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
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Farhan Siddiqui"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Admission Number</span>
                    <span className="text-[10px] text-slate-400">Institutional ID</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentStudent.admissionNumber}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Academic Course / Program *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    placeholder="e.g. B.A. History / B.Tech Computer Science"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Academic Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Humanities & Languages"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Academic Batch
                  </label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    placeholder="e.g. 2023-2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. scholar@institution.edu"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Permanent / Residential Address</span>
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Kishanganj, Bihar"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800 text-xs">
                    Phone / Contact Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Academic Bio / Honoree Accolade Quote</span>
                    <span className="text-[10px] text-slate-400">Featured in dossier & rankings</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. Author of recognized historical publications, archival reviewer, and inter-collegiate debate finalist."
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isSavingProfile ? 'Saving Real Data...' : 'Save Profile Changes'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
