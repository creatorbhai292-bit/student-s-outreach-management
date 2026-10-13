/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Student,
  ActivitySubmission,
  PointRule,
  RankPointRule,
  FeaturedStudentTitle,
  AchievementBadge,
  IssuedCertificate,
  ActivityCategory,
  SubmissionStatus,
  PointHistoryRecord,
} from '../types';
import {
  exportStudentReportPDF,
  exportCertificatePDF,
  exportLeaderboardPDF,
} from '../lib/pdfExport';
import {
  exportAdminFullDataExcel,
  exportStudentDataExcel,
  exportModuleExcel,
  exportPointHistoryLedgerExcel,
} from '../lib/excelExport';
import { fileToBase64, isSupabaseConnected } from '../lib/db';
import { AdminPublicProfilesTab } from './AdminPublicProfilesTab';
import { AdminAnnouncementsTab } from './AdminAnnouncementsTab';
import { AdminSupabaseTab } from './AdminSupabaseTab';
import { AdminMediaGalleryTab } from './AdminMediaGalleryTab';
import {
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Award,
  BookOpen,
  Trophy,
  Sliders,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Settings,
  Calendar as CalendarIcon,
  Bell,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Star,
  ExternalLink,
  Upload,
  RefreshCw,
  QrCode,
  Sparkles,
  ChevronRight,
  Filter,
  MessageSquare,
  History,
  Download,
  ArrowUpDown,
  Layers,
  UserCheck,
  Hash,
  Layout,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  UserCircle,
  Megaphone,
  Database,
  Cloud,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    students,
    submissions,
    pointRules,
    rankRules,
    pointHistory,
    featuredTitles,
    badges,
    certificates,
    notifications,
    auditLogs,
    settings,
    activeAdminTab,
    setActiveAdminTab,
    approveActivity,
    rejectActivity,
    requestCorrectionActivity,
    toggleFeatureActivity,
    deleteActivity,
    addStudent,
    updateStudent,
    announcements,
    saveAnnouncement,
    deleteAnnouncement,
    deleteStudent,
    toggleStudentStatus,
    savePointRule,
    deletePointRule,
    saveRankRule,
    deleteRankRule,
    saveFeaturedTitle,
    deleteFeaturedTitle,
    saveBadge,
    deleteBadge,
    issueNewCertificate,
    deleteCertificate,
    deletePointHistoryRecord,
    clearPointHistory,
    deleteAuditLog,
    clearAuditLogs,
    updateSettings,
    resetDatabaseToDefault,
    showToast,
    setVerificationCertId,
    setActiveView,
  } = useApp();

  // Front Page Hero Editor State
  const [heroBadgeText, setHeroBadgeText] = useState(
    settings.heroBadgeText ?? 'Celebrating Student Excellence & Institutional Outreach'
  );
  const [heroHeadingPrefix, setHeroHeadingPrefix] = useState(
    settings.heroHeadingPrefix &&
    settings.heroHeadingPrefix !== 'Celebrating Student' &&
    settings.heroHeadingPrefix !== 'Students Outreach Management'
      ? settings.heroHeadingPrefix
      : 'Students Outreach'
  );
  const [heroHeadingHighlight, setHeroHeadingHighlight] = useState(
    settings.heroHeadingHighlight &&
    settings.heroHeadingHighlight !== 'Excellence' &&
    settings.heroHeadingHighlight !== 'Software'
      ? settings.heroHeadingHighlight
      : 'Dashboard'
  );
  const [heroDescription, setHeroDescription] = useState(
    settings.heroDescription ??
      'A comprehensive academic platform honouring student achievements, literary publications, research symposiums, collegiate programs, competitions, and merit rankings.'
  );
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState(settings.heroPrimaryBtnText ?? 'Explore Achievements');
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState(settings.heroSecondaryBtnText ?? 'Student Login');
  const [heroShowBadge, setHeroShowBadge] = useState(settings.heroShowBadge !== false);
  const [heroShowStats, setHeroShowStats] = useState(settings.heroShowStats !== false);
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(settings.showAnnouncementBar ?? true);
  const [announcementBarText, setAnnouncementBarText] = useState(
    settings.announcementBarText ?? 'Monthly Assembly: The August assembly will be held on September 15 at the CHS Conference Hall.'
  );
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroSavedNotice, setHeroSavedNotice] = useState(false);

  // Sync with settings updates
  React.useEffect(() => {
    if (settings) {
      if (settings.heroBadgeText !== undefined) setHeroBadgeText(settings.heroBadgeText);
      if (settings.heroHeadingPrefix !== undefined) setHeroHeadingPrefix(settings.heroHeadingPrefix);
      if (settings.heroHeadingHighlight !== undefined) setHeroHeadingHighlight(settings.heroHeadingHighlight);
      if (settings.heroDescription !== undefined) setHeroDescription(settings.heroDescription);
      if (settings.heroPrimaryBtnText !== undefined) setHeroPrimaryBtnText(settings.heroPrimaryBtnText);
      if (settings.heroSecondaryBtnText !== undefined) setHeroSecondaryBtnText(settings.heroSecondaryBtnText);
      if (settings.heroShowBadge !== undefined) setHeroShowBadge(settings.heroShowBadge);
      if (settings.heroShowStats !== undefined) setHeroShowStats(settings.heroShowStats);
      if (settings.showAnnouncementBar !== undefined) setShowAnnouncementBar(settings.showAnnouncementBar);
      if (settings.announcementBarText !== undefined) setAnnouncementBarText(settings.announcementBarText);
    }
  }, [settings]);

  const handleSaveHero = async () => {
    try {
      setIsSavingHero(true);
      await updateSettings({
        ...settings,
        heroBadgeText,
        heroHeadingPrefix,
        heroHeadingHighlight,
        heroDescription,
        heroPrimaryBtnText,
        heroSecondaryBtnText,
        heroShowBadge,
        heroShowStats,
        showAnnouncementBar,
        announcementBarText,
      });
      setIsSavingHero(false);
      setHeroSavedNotice(true);
      showToast('Front Page updated successfully! Changes are live on the homepage.', 'success');
      setTimeout(() => setHeroSavedNotice(false), 5000);
    } catch (err: unknown) {
      setIsSavingHero(false);
      showToast(err instanceof Error ? err.message : 'Error updating Front Page.', 'error');
    }
  };

  const handleResetHeroToDefault = async () => {
    if (!window.confirm('Reset the Front Page Hero to original default text?')) return;
    const defaults = {
      heroBadgeText: 'Celebrating Student Excellence & Institutional Outreach',
      heroHeadingPrefix: 'Students Outreach',
      heroHeadingHighlight: 'Dashboard',
      heroDescription:
        'A comprehensive academic platform honouring student achievements, literary publications, research symposiums, collegiate programs, competitions, and merit rankings.',
      heroPrimaryBtnText: 'Explore Achievements',
      heroSecondaryBtnText: 'Student Login',
      heroShowBadge: true,
      heroShowStats: true,
      showAnnouncementBar: true,
      announcementBarText: 'Monthly Assembly: The August assembly will be held on September 15 at the CHS Conference Hall.',
    };
    setHeroBadgeText(defaults.heroBadgeText);
    setHeroHeadingPrefix(defaults.heroHeadingPrefix);
    setHeroHeadingHighlight(defaults.heroHeadingHighlight);
    setHeroDescription(defaults.heroDescription);
    setHeroPrimaryBtnText(defaults.heroPrimaryBtnText);
    setHeroSecondaryBtnText(defaults.heroSecondaryBtnText);
    setHeroShowBadge(defaults.heroShowBadge);
    setHeroShowStats(defaults.heroShowStats);
    setShowAnnouncementBar(defaults.showAnnouncementBar);
    setAnnouncementBarText(defaults.announcementBarText);

    await updateSettings({
      ...settings,
      ...defaults,
    });
    showToast('Front Page reset to default text.', 'info');
  };

  // Search & Global Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');
  const [moduleStatusFilter, setModuleStatusFilter] = useState<string>('all');
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>('');

  // Point History Ledger Category Tab & Filter State
  const [ledgerCategoryTab, setLedgerCategoryTab] = useState<string>('all');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [ledgerSortOrder, setLedgerSortOrder] = useState<'newest' | 'oldest' | 'delta-desc' | 'final-desc'>('newest');
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<PointHistoryRecord | null>(null);

  // Dynamically compute all categories present in the system, student submissions, or point history
  const dynamicLedgerCategories = useMemo(() => {
    const standardMap: Record<string, { label: string; icon: any; color: string; badgeColor: string }> = {
      publication: {
        label: 'Publications',
        icon: BookOpen,
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      paper_presentation: {
        label: 'Paper Presentations',
        icon: FileText,
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      },
      seminar: {
        label: 'Seminars & Colloquiums',
        icon: Users,
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      },
      college_program: {
        label: 'College Programs',
        icon: CalendarIcon,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      outside_program: {
        label: 'Outside Programs',
        icon: ExternalLink,
        color: 'text-teal-700 bg-teal-50 border-teal-200',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
      },
      competition: {
        label: 'Competitions & Hackathons',
        icon: Trophy,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      },
      award: {
        label: 'Awards & Distinctions',
        icon: Award,
        color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      },
      other_activity: {
        label: 'Other Activities',
        icon: Sparkles,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    };

    const catKeysSet = new Set<string>();

    // Standard baseline categories
    Object.keys(standardMap).forEach((k) => catKeysSet.add(k));

    // Dynamic discovery from all student submissions
    submissions.forEach((s) => {
      if (s.category && typeof s.category === 'string') {
        catKeysSet.add(s.category);
      }
    });

    // Dynamic discovery from point history ledger
    pointHistory.forEach((ph) => {
      if (ph.category && typeof ph.category === 'string') {
        catKeysSet.add(ph.category);
      }
    });

    // Dynamic discovery from point rules
    pointRules.forEach((pr) => {
      if (pr.category && typeof pr.category === 'string') {
        catKeysSet.add(pr.category);
      }
    });

    const categoryList = Array.from(catKeysSet).map((key) => {
      const std = standardMap[key];
      const records = pointHistory.filter((ph) => ph.category === key);
      const studentSubs = submissions.filter((s) => s.category === key);
      const pointsTotal = records.reduce((sum, r) => sum + (r.pointsAdded || 0), 0);

      // Clean, professional title formatting
      const label =
        std?.label ||
        key
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

      return {
        key,
        label,
        icon: std?.icon || Sparkles,
        color: std?.color || 'text-cyan-700 bg-cyan-50 border-cyan-200',
        badgeColor: std?.badgeColor || 'bg-cyan-100 text-cyan-800 border-cyan-300',
        historyCount: records.length,
        submissionsCount: studentSubs.length,
        pointsTotal,
      };
    });

    const priority: Record<string, number> = {
      publication: 1,
      paper_presentation: 2,
      seminar: 3,
      college_program: 4,
      outside_program: 5,
      competition: 6,
      award: 7,
      other_activity: 8,
    };

    return categoryList.sort((a, b) => (priority[a.key] || 99) - (priority[b.key] || 99));
  }, [pointHistory, submissions, pointRules]);

  // Filtered and sorted point history ledger records
  const filteredPointHistory = useMemo(() => {
    return pointHistory
      .filter((ph) => {
        // Category Tab filter
        if (ledgerCategoryTab !== 'all' && ph.category !== ledgerCategoryTab) {
          return false;
        }
        // Search query
        if (ledgerSearchQuery.trim()) {
          const q = ledgerSearchQuery.toLowerCase();
          const student = students.find((s) => s.id === ph.studentId);
          return (
            ph.studentName.toLowerCase().includes(q) ||
            ph.activityTitle.toLowerCase().includes(q) ||
            ph.adminName.toLowerCase().includes(q) ||
            (ph.reason && ph.reason.toLowerCase().includes(q)) ||
            (student?.admissionNumber && student.admissionNumber.toLowerCase().includes(q)) ||
            (student?.course && student.course.toLowerCase().includes(q)) ||
            (student?.department && student.department.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (ledgerSortOrder === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (ledgerSortOrder === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (ledgerSortOrder === 'delta-desc') {
          return (b.pointsAdded || 0) - (a.pointsAdded || 0);
        }
        if (ledgerSortOrder === 'final-desc') {
          return (b.finalPoints || 0) - (a.finalPoints || 0);
        }
        return 0;
      });
  }, [pointHistory, ledgerCategoryTab, ledgerSearchQuery, ledgerSortOrder, students]);

  // Active Category summary metrics
  const activeCategoryMetrics = useMemo(() => {
    const records =
      ledgerCategoryTab === 'all'
        ? pointHistory
        : pointHistory.filter((ph) => ph.category === ledgerCategoryTab);

    const totalPoints = records.reduce((sum, r) => sum + (r.pointsAdded || 0), 0);
    const uniqueStudents = new Set(records.map((r) => r.studentId)).size;
    const avgPoints = records.length > 0 ? (totalPoints / records.length).toFixed(1) : '0';
    const totalSubmissions =
      ledgerCategoryTab === 'all'
        ? submissions.length
        : submissions.filter((s) => s.category === ledgerCategoryTab).length;

    return {
      totalRecords: records.length,
      totalPoints,
      uniqueStudents,
      avgPoints,
      totalSubmissions,
    };
  }, [pointHistory, ledgerCategoryTab, submissions]);

  // Review Modal State
  const [selectedSubForReview, setSelectedSubForReview] = useState<ActivitySubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'correction' | null>(null);
  const [reviewPoints, setReviewPoints] = useState<number>(10);
  const [reviewNote, setReviewNote] = useState<string>('');

  // Student CRUD Modal State
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormAdmNo, setStudentFormAdmNo] = useState('');
  const [studentFormEmail, setStudentFormEmail] = useState('');
  const [studentFormAddress, setStudentFormAddress] = useState('');
  const [studentFormCourse, setStudentFormCourse] = useState('B.A. English Literature');
  const [studentFormDept, setStudentFormDept] = useState('Humanities & Languages');
  const [studentFormBatch, setStudentFormBatch] = useState('2023-2026');
  const [studentFormAvatar, setStudentFormAvatar] = useState('');
  const [studentFormBio, setStudentFormBio] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Stably sorted student list to prevent layout jitter / thrashing
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const rankA = a.rank ?? 9999;
      const rankB = b.rank ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.admissionNumber.localeCompare(b.admissionNumber);
    });
  }, [students]);

  const displayedStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return sortedStudents;
    const q = studentSearchTerm.toLowerCase();
    return sortedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        (s.department && s.department.toLowerCase().includes(q))
    );
  }, [sortedStudents, studentSearchTerm]);

  // Point Rule Modal State
  const [showPointRuleModal, setShowPointRuleModal] = useState<boolean>(false);
  const [ruleCategory, setRuleCategory] = useState<ActivityCategory>('publication');
  const [ruleType, setRuleType] = useState('');
  const [ruleRecPoints, setRuleRecPoints] = useState<number>(15);
  const [ruleMaxPoints, setRuleMaxPoints] = useState<number>(30);
  const [ruleNote, setRuleNote] = useState('');

  // Featured Title Modal State
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [titleName, setTitleName] = useState('');
  const [titleStudentId, setTitleStudentId] = useState('');
  const [titleDescription, setTitleDescription] = useState('');
  const [titleSession, setTitleSession] = useState('2025-2026');
  const [titleSubtitle, setTitleSubtitle] = useState('');
  const [titleOrder, setTitleOrder] = useState<number>(1);
  const [titleShowHome, setTitleShowHome] = useState<boolean>(true);

  // Issue Certificate Modal State
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [certStudentId, setCertStudentId] = useState('');
  const [certActivityId, setCertActivityId] = useState('');
  const [certDetails, setCertDetails] = useState('');

  // Handle Review Open
  const handleOpenReview = (sub: ActivitySubmission, action: 'approve' | 'reject' | 'correction') => {
    setSelectedSubForReview(sub);
    setReviewAction(action);
    setReviewPoints(sub.recommendedPoints || 10);
    setReviewNote(
      action === 'approve'
        ? sub.adminReviewNote || 'Verified and approved by Academic Review Committee.'
        : ''
    );
  };

  // Submit Review Modal
  const handleConfirmReview = async () => {
    if (!selectedSubForReview || !reviewAction) return;

    if (reviewAction === 'approve') {
      await approveActivity(selectedSubForReview.id, Number(reviewPoints), reviewNote);
    } else if (reviewAction === 'reject') {
      if (!reviewNote.trim()) {
        showToast('Please provide a reason for rejection.', 'error');
        return;
      }
      await rejectActivity(selectedSubForReview.id, reviewNote);
    } else if (reviewAction === 'correction') {
      if (!reviewNote.trim()) {
        showToast('Please specify the required corrections.', 'error');
        return;
      }
      await requestCorrectionActivity(selectedSubForReview.id, reviewNote);
    }

    setSelectedSubForReview(null);
    setReviewAction(null);
  };

  // Student CRUD Save
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent({
          ...editingStudent,
          name: studentFormName,
          admissionNumber: studentFormAdmNo,
          email: studentFormEmail,
          address: studentFormAddress.trim(),
          course: studentFormCourse,
          department: studentFormDept,
          batch: studentFormBatch,
          avatarUrl: studentFormAvatar || editingStudent.avatarUrl,
          bio: studentFormBio,
        });
      } else {
        await addStudent({
          name: studentFormName,
          admissionNumber: studentFormAdmNo,
          email: studentFormEmail,
          address: studentFormAddress.trim(),
          course: studentFormCourse,
          department: studentFormDept,
          batch: studentFormBatch,
          avatarUrl: studentFormAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
          isActive: true,
          bio: studentFormBio,
        });
      }
      setShowStudentModal(false);
      setEditingStudent(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving student record.', 'error');
    }
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { id: 'front-page-admin', label: 'Front Page & Hero Editor', icon: Layout },
    { id: 'review-center', label: 'Review Center', icon: ShieldCheck, badge: submissions.filter((s) => s.status === 'pending').length },
    
    { id: 'students', label: 'Student Accounts', icon: Users, badge: students.length },
    { id: 'public-profiles', label: 'Public Profiles', icon: UserCircle },
    { id: 'images-admin', label: 'Media & Images Hub', icon: ImageIcon },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },

    { id: 'modules-pub', label: 'Publications', icon: BookOpen },
    { id: 'modules-pres', label: 'Paper Presentations', icon: FileText },
    { id: 'modules-sem', label: 'Seminars & Colloquiums', icon: CalendarIcon },
    { id: 'modules-prog', label: 'College & Outside Programs', icon: Award },
    { id: 'modules-comp', label: 'Competitions & Hackathons', icon: Trophy },
    { id: 'modules-awd', label: 'Awards & Distinctions', icon: Sparkles },
    { id: 'point-rules', label: 'Point Rules & Ranks', icon: Sliders },
    { id: 'point-history', label: 'Point History Ledger', icon: TrendingUp },
    { id: 'featured-titles', label: 'Featured Titles & Honors', icon: Star },
    { id: 'leaderboard-admin', label: 'Campus Leaderboard', icon: Trophy },
    { id: 'certificates-admin', label: 'Certificates & QR', icon: QrCode },
    { id: 'reports-admin', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'audit-logs', label: 'Admin Audit Logs', icon: Clock },
    { id: 'supabase-admin', label: 'Supabase Cloud & Storage', icon: Database },
    { id: 'settings-admin', label: 'Settings & Branding', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div className="space-y-6">
          
          <div className="px-3 py-2 flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Admin Console</h2>
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Super Administrator</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-menu-${item.id}`}
                  onClick={() => setActiveAdminTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-blue-700' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 px-2 space-y-2">
          <button
            type="button"
            onClick={() => setActiveAdminTab('supabase-admin')}
            className="w-full text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Cloud</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-slate-300">
              PostgreSQL & 50–80 KB Storage
            </p>
          </button>
          <button
            onClick={resetDatabaseToDefault}
            className="w-full text-left text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer pt-1 px-1"
            title="Reset to sample demo data"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Initial Demo Data
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* TAB 1: DASHBOARD & ANALYTICS */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Outreach Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1">Real-time overview of student publications, submissions, points distribution, and approval metrics.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Students</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{students.length}</p>
                <span className="text-[11px] text-emerald-600 font-medium mt-2 block">
                  {students.filter((s) => s.isActive).length} Active accounts
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Submissions</span>
                <p className="text-3xl font-black text-amber-500 mt-1">
                  {submissions.filter((s) => s.status === 'pending').length}
                </p>
                <span className="text-[11px] text-amber-600 font-medium mt-2 block">Require Admin Verification</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Approved Honors</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {submissions.filter((s) => s.status === 'approved').length}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium mt-2 block">Verified in database</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Awarded Points</span>
                <p className="text-3xl font-black text-blue-700 mt-1">
                  {students.reduce((acc, s) => acc + (s.totalPoints || 0), 0)}
                </p>
                <span className="text-[11px] text-blue-600 font-medium mt-2 block">Dynamic student total</span>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Submissions by Category</h3>
                <div className="space-y-3">
                  {[
                    { cat: 'publication', label: 'Publications & Articles', color: 'bg-blue-600' },
                    { cat: 'paper_presentation', label: 'Paper Presentations', color: 'bg-indigo-600' },
                    { cat: 'seminar', label: 'Seminars & Colloquiums', color: 'bg-purple-600' },
                    { cat: 'college_program', label: 'College Programs', color: 'bg-amber-600' },
                    { cat: 'outside_program', label: 'Outside College Programs', color: 'bg-emerald-600' },
                    { cat: 'competition', label: 'Competitions & Hackathons', color: 'bg-rose-600' },
                    { cat: 'award', label: 'Awards & Distinctions', color: 'bg-yellow-500' },
                  ].map((c) => {
                    const count = submissions.filter((s) => s.category === c.cat).length;
                    const pct = submissions.length ? Math.round((count / submissions.length) * 100) : 0;
                    return (
                      <div key={c.cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{c.label}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Pending Queue */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Pending Submissions Queue</h3>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {submissions.filter((s) => s.status === 'pending').slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleOpenReview(p, 'approve')}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{p.studentName} ({p.studentAdmissionNo})</p>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md shrink-0">
                          Review
                        </span>
                      </div>
                    ))}
                    {submissions.filter((s) => s.status === 'pending').length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400">
                        Zero pending submissions. All student activities are verified!
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveAdminTab('review-center')}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    Go to Full Review Center <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportAdminFullDataExcel(students, submissions, pointRules, certificates, pointHistory)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Quick Excel Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FRONT PAGE & HERO EDITOR */}
        {activeAdminTab === 'front-page-admin' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Front Page & Hero Editor</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize the homepage hero banner, top badge, headline, subtitle, buttons, and display toggles in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open live public homepage"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  View Front Page
                </button>
                <button
                  type="button"
                  onClick={handleResetHeroToDefault}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to Imperial default texts"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={isSavingHero}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingHero ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save & Publish Changes
                </button>
              </div>
            </div>

            {/* Success notification banner */}
            {heroSavedNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-medium animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Front Page Hero has been published! All changes are now live on the public front page.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="underline font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                >
                  Inspect Home Page →
                </button>
              </div>
            )}

            {/* LIVE PREVIEW BANNER (Replicating user's screenshot) */}
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Live Front Page Simulation (Updates in real time)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Section: Homepage &gt; Hero</span>
              </div>

              {/* Exact Dark Canvas Preview */}
              <div className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-10 text-center border border-blue-900/40 space-y-5">
                {/* Radial Glows & dots */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  {/* Announcement banner preview if enabled */}
                  {showAnnouncementBar && announcementBarText && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{announcementBarText}</span>
                    </div>
                  )}

                  {/* Top Badge Pill Preview */}
                  {heroShowBadge && (
                    <div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{heroBadgeText || 'Celebrating Student Excellence & Institutional Outreach'}</span>
                      </div>
                    </div>
                  )}

                  {/* Main Headline Preview */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                    {heroHeadingPrefix || 'Students Outreach'}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-amber-200 to-indigo-300 font-black">
                      {heroHeadingHighlight || 'Dashboard'}
                    </span>
                  </h2>

                  {/* Subtitle / Description Preview */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                    {heroDescription ||
                      'A comprehensive academic platform honouring student achievements, literary publications, research symposiums, collegiate programs, competitions, and merit rankings.'}
                  </p>

                  {/* CTA Buttons Preview */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <div className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-default">
                      <Award className="w-4 h-4" />
                      {heroPrimaryBtnText || 'Explore Achievements'}
                    </div>
                    <div className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 cursor-default">
                      <GraduationCap className="w-4 h-4" />
                      {heroSecondaryBtnText || 'Student Login'}
                    </div>
                  </div>

                  {/* Live Statistics Cards Preview */}
                  {heroShowStats && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-6 border-t border-slate-800/80 mt-6">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-white block">{students.length}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Students</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-white block">
                          {submissions.filter((s) => s.status === 'approved').length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Honors</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-white block">
                          {submissions.filter((s) => s.status === 'approved' && s.category === 'publication').length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Publications</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-amber-300 block">
                          {students.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Points</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-white block">
                          {submissions.filter(
                            (s) => s.status === 'approved' && (s.category === 'college_program' || s.category === 'outside_program')
                          ).length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Programs</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="text-base font-black text-white block">
                          {submissions.filter((s) => s.status === 'approved' && s.category === 'competition').length}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Contests</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EDITABLE FORM CONTROLS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card A: Hero Headlines */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Main Hero Headline Configuration</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Headline Prefix / First Words
                    </label>
                    <input
                      type="text"
                      value={heroHeadingPrefix}
                      onChange={(e) => setHeroHeadingPrefix(e.target.value)}
                      placeholder="e.g. Students Outreach"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                    <p className="text-[11px] text-slate-400">Rendered in high-contrast solid white display typography.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Highlighted Gradient Word / Suffix
                    </label>
                    <input
                      type="text"
                      value={heroHeadingHighlight}
                      onChange={(e) => setHeroHeadingHighlight(e.target.value)}
                      placeholder="e.g. Dashboard"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                    />
                    <p className="text-[11px] text-slate-400">
                      Rendered with the golden-amber & sky-blue shimmer gradient on the front page.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                    <span className="text-[11px] text-blue-700 font-medium">Combined Headline:</span>
                    <span className="text-xs font-black text-slate-900">
                      {heroHeadingPrefix} <span className="text-blue-600 font-black">{heroHeadingHighlight}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card B: Badge Pill & Subtitle */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Top Badge Pill & Description</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-700">Display Animated Top Badge Pill</span>
                    <input
                      type="checkbox"
                      checked={heroShowBadge}
                      onChange={(e) => setHeroShowBadge(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  {heroShowBadge && (
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={heroBadgeText}
                        onChange={(e) => setHeroBadgeText(e.target.value)}
                        placeholder="e.g. Celebrating Student Excellence & Institutional Outreach"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 block">
                        Hero Description / Subtitle Paragraph
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">{heroDescription.length} chars</span>
                    </div>
                    <textarea
                      rows={3}
                      value={heroDescription}
                      onChange={(e) => setHeroDescription(e.target.value)}
                      placeholder="Enter subtitle text for the homepage hero..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Card C: Call-to-Action Buttons */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Hero Action Buttons</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Primary Button Label
                    </label>
                    <input
                      type="text"
                      value={heroPrimaryBtnText}
                      onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                      placeholder="e.g. Explore Achievements"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400">Scrolls smoothly to the public achievements gallery.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      value={heroSecondaryBtnText}
                      onChange={(e) => setHeroSecondaryBtnText(e.target.value)}
                      placeholder="e.g. Student Login"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400">Opens the Student Portal login modal.</p>
                  </div>
                </div>
              </div>

              {/* Card D: Toggles & Announcement Ribbon */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Homepage Stats & Announcement</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-semibold text-slate-700 block">Show 6 Animated Live Statistic Cards</span>
                      <span className="text-[11px] text-slate-400">
                        Displays dynamic counters for Students, Honors, Publications, Points, Programs, and Contests.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={heroShowStats}
                      onChange={(e) => setHeroShowStats(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0 ml-3"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="font-semibold text-slate-700 block">Top Announcement Ribbon</span>
                        <span className="text-[11px] text-slate-400">
                          Displays an amber alert banner above the main hero heading.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={showAnnouncementBar}
                        onChange={(e) => setShowAnnouncementBar(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0 ml-3"
                      />
                    </label>

                    {showAnnouncementBar && (
                      <input
                        type="text"
                        value={announcementBarText}
                        onChange={(e) => setAnnouncementBarText(e.target.value)}
                        placeholder="e.g. Welcome to the Academic Portal 2025-2026"
                        className="w-full mt-2 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Floating Save Button Bar */}
            <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-medium">
                  Changes saved here apply immediately to the public front page in real time.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  View Front Page
                </button>
                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={isSavingHero}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSavingHero ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save & Publish to Front Page
                </button>
              </div>
            </div>

          </div>
        )}
        {activeAdminTab === 'review-center' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activity Review & Verification Center</h1>
                <p className="text-xs text-slate-500 mt-1">Audit student submissions, inspect attached certificates/clippings, and award academic merit points.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student, title, admission..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="correction_requested">Correction Requested</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>

            {/* Submissions Table / Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Category / Subtype</th>
                      <th className="py-3 px-4">Activity Title</th>
                      <th className="py-3 px-4">Date & Venue</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions
                      .filter((s) => {
                        if (reviewStatusFilter !== 'all' && s.status !== reviewStatusFilter) return false;
                        if (reviewCategoryFilter !== 'all' && s.category !== reviewCategoryFilter) return false;
                        if (searchQuery.trim()) {
                          const q = searchQuery.toLowerCase();
                          return (
                            s.title.toLowerCase().includes(q) ||
                            s.studentName.toLowerCase().includes(q) ||
                            s.studentAdmissionNo.toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>{sub.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">{sub.studentAdmissionNo}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="uppercase text-[10px] font-bold text-slate-600 block">
                              {sub.category.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400">{sub.subType || '-'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                            {sub.title}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            <div>{sub.date}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{sub.venueOrOrganizer || '-'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              sub.status === 'correction_requested' ? 'bg-orange-100 text-orange-800' :
                              sub.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {sub.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            {sub.awardedPoints > 0 ? `+${sub.awardedPoints}` : `Rec: ${sub.recommendedPoints}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleFeatureActivity(sub.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                sub.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'
                              }`}
                              title={sub.isFeatured ? 'Featured on Website' : 'Not featured'}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenReview(sub, 'approve')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(sub, 'correction')}
                                className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] cursor-pointer"
                              >
                                Correction
                              </button>
                              <button
                                onClick={() => handleOpenReview(sub, 'reject')}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Permanently delete submission "${sub.title}" by ${sub.studentName}?`)) {
                                    deleteActivity(sub.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Permanently Delete Submission"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT ACCOUNTS MANAGEMENT (CRUD) */}
        {activeAdminTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Accounts Management</h1>
                <p className="text-xs text-slate-500 mt-1">Enroll, edit profiles, toggle account active status, and generate dossiers.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Filter */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 w-64 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, course..."
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                  {studentSearchTerm && (
                    <button
                      onClick={() => setStudentSearchTerm('')}
                      className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  id="admin-add-student-btn"
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentFormName('');
                    setStudentFormAdmNo(`ADM2026-${String(students.length + 1).padStart(3, '0')}`);
                    setStudentFormEmail('');
                    setStudentFormAddress('');
                    setStudentFormCourse('B.Tech Computer Science');
                    setStudentFormDept('School of Computing');
                    setStudentFormBatch('2024-2028');
                    setStudentFormAvatar('');
                    setStudentFormBio('');
                    setShowStudentModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add New Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[950px] table-fixed">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-[280px]">Student</th>
                      <th className="py-3 px-4 w-[140px] whitespace-nowrap">Admission No</th>
                      <th className="py-3 px-4 w-[220px]">Course & Department</th>
                      <th className="py-3 px-4 w-[100px] whitespace-nowrap">Batch</th>
                      <th className="py-3 px-4 w-[110px] whitespace-nowrap">Total Points</th>
                      <th className="py-3 px-4 w-[80px] whitespace-nowrap">Rank</th>
                      <th className="py-3 px-4 w-[110px] whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 w-[130px] whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <img
                              src={std.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                              alt={std.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 block truncate">{std.name}</span>
                              <span className="text-[11px] text-slate-400 block truncate">{std.email}</span>
                              {std.address && (
                                <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{std.address}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">{std.admissionNumber}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="truncate font-medium">{std.course}</div>
                          <div className="text-[10px] text-slate-400 truncate">{std.department}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{std.batch}</td>
                        <td className="py-3.5 px-4 font-black text-blue-700 whitespace-nowrap">{std.totalPoints} pts</td>
                        <td className="py-3.5 px-4 font-black text-amber-600 whitespace-nowrap">#{std.rank || '-'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStudentStatus(std.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                              std.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {std.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingStudent(std);
                                setStudentFormName(std.name);
                                setStudentFormAdmNo(std.admissionNumber);
                                setStudentFormEmail(std.email);
                                setStudentFormAddress(std.address || '');
                                setStudentFormCourse(std.course);
                                setStudentFormDept(std.department);
                                setStudentFormBatch(std.batch);
                                setStudentFormAvatar(std.avatarUrl);
                                setStudentFormBio(std.bio || '');
                                setShowStudentModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                              title="Edit Student"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                exportStudentReportPDF(
                                  std,
                                  submissions.filter((s) => s.studentId === std.id),
                                  pointHistory.filter((ph) => ph.studentId === std.id),
                                  settings.organizationName,
                                  settings.logoUrl
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors"
                              title="Generate Student Dossier PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStudent(std.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INDIVIDUAL MODULES (PUBLICATIONS, PRESENTATIONS, ETC.) */}
        
        {activeAdminTab === 'public-profiles' && (
          <AdminPublicProfilesTab
            students={students}
            updateStudent={updateStudent}
            deleteStudent={deleteStudent}
            badges={badges}
            featuredTitles={featuredTitles}
          />
        )}

        {activeAdminTab === 'images-admin' && (
          <AdminMediaGalleryTab />
        )}

        {activeAdminTab === 'announcements' && (
          <AdminAnnouncementsTab
            announcements={announcements}
            saveAnnouncement={saveAnnouncement}
            deleteAnnouncement={deleteAnnouncement}
          />
        )}

        {activeAdminTab.startsWith('modules-') && (
          <div className="space-y-6">
            {(() => {
              const modKey = activeAdminTab.replace('modules-', '');
              const categoryMap: Record<string, { cat: ActivityCategory; title: string }> = {
                pub: { cat: 'publication', title: 'Publications Management' },
                pres: { cat: 'paper_presentation', title: 'Paper Presentations Management' },
                sem: { cat: 'seminar', title: 'Seminars & Colloquiums' },
                prog: { cat: 'college_program', title: 'College & Outside Programs' },
                comp: { cat: 'competition', title: 'Competitions & Hackathons' },
                awd: { cat: 'award', title: 'Awards & Distinctions' },
              };

              const currentMod = categoryMap[modKey] || { cat: 'publication', title: 'Module' };
              const allModSubs = submissions.filter((s) => {
                if (modKey === 'prog') return s.category === 'college_program' || s.category === 'outside_program';
                return s.category === currentMod.cat;
              });

              // Status Counts
              const pendingCount = allModSubs.filter((s) => s.status === 'pending').length;
              const approvedCount = allModSubs.filter((s) => s.status === 'approved').length;
              const correctionCount = allModSubs.filter((s) => s.status === 'correction_requested').length;
              const rejectedCount = allModSubs.filter((s) => s.status === 'rejected').length;

              // Filtered Submissions
              const modSubs = allModSubs.filter((s) => {
                const matchesStatus =
                  moduleStatusFilter === 'all' ? true : s.status === moduleStatusFilter;
                const matchesSearch =
                  moduleSearchQuery.trim() === '' ||
                  s.title.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                  s.studentName.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                  s.studentAdmissionNo.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
                  (s.venueOrOrganizer && s.venueOrOrganizer.toLowerCase().includes(moduleSearchQuery.toLowerCase()));
                return matchesStatus && matchesSearch;
              });

              return (
                <div className="space-y-6">
                  {/* Module Header & Action Bar */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider">
                          Module Administration
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Workflow: Approve, Reject & Student Messaging
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">{currentMod.title}</h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Review submissions, verify institutional documentation, award merit points, reject invalid files, or message students directly when issues occur.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => exportModuleExcel(currentMod.title, allModSubs)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Module Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Metric Tabs */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      {/* Status Filter Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                        <button
                          onClick={() => setModuleStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            moduleStatusFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          All ({allModSubs.length})
                        </button>
                        <button
                          onClick={() => setModuleStatusFilter('pending')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            moduleStatusFilter === 'pending'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending ({pendingCount})</span>
                        </button>
                        <button
                          onClick={() => setModuleStatusFilter('approved')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            moduleStatusFilter === 'approved'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved ({approvedCount})</span>
                        </button>
                        <button
                          onClick={() => setModuleStatusFilter('correction_requested')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            moduleStatusFilter === 'correction_requested'
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Issues / Message Sent ({correctionCount})</span>
                        </button>
                        <button
                          onClick={() => setModuleStatusFilter('rejected')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            moduleStatusFilter === 'rejected'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected ({rejectedCount})</span>
                        </button>
                      </div>

                      {/* Module Specific Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search in this module..."
                          value={moduleSearchQuery}
                          onChange={(e) => setModuleSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {modSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Header: SubType & Status Pill */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] uppercase tracking-wider">
                              {sub.subType || sub.category.replace('_', ' ')}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 ${
                                sub.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : sub.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : sub.status === 'correction_requested'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {sub.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {sub.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                              {sub.status === 'correction_requested' && <MessageSquare className="w-3 h-3 text-orange-600" />}
                              {sub.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>
                                {sub.status === 'correction_requested' ? 'ISSUE REPORTED' : sub.status.toUpperCase()}
                              </span>
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                              {sub.studentName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{sub.studentName}</h4>
                              <p className="text-[10px] text-slate-400 truncate">
                                Adm: {sub.studentAdmissionNo} • {sub.date}
                              </p>
                            </div>
                            {sub.awardedPoints ? (
                              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                {sub.awardedPoints} pts
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                ~{sub.recommendedPoints} pts
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                              {sub.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {sub.description}
                            </p>
                          </div>

                          {/* Venue or Proof Link */}
                          {sub.venueOrOrganizer && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 truncate">
                              <span className="font-semibold text-slate-700">Venue / Org:</span> {sub.venueOrOrganizer}
                            </div>
                          )}

                          {/* Active Admin Message / Issue Display */}
                          {sub.adminReviewNote && (
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[10px] uppercase">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>Note / Message to Student:</span>
                              </div>
                              <p className="text-amber-800 text-[11px] leading-relaxed italic">
                                "{sub.adminReviewNote}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Complete Action Buttons: Approve, Reject, Message Student, Inspect */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {/* APPROVE BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub, 'approve')}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                              title="Approve submission and award merit points"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{sub.status === 'approved' ? 'Re-Approve' : 'Approve'}</span>
                            </button>

                            {/* REJECT BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub, 'reject')}
                              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Reject submission with reason"
                            >
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Reject</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* MESSAGE / CORRECTION BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub, 'correction')}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Send a message to student explaining any issues"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Message / Issue</span>
                            </button>

                            {/* INSPECT DETAILS BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(sub, 'approve')}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              title="Inspect full details and proof"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Inspect Proof</span>
                            </button>
                          </div>

                          {/* DELETE RECORD BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Permanently delete submission "${sub.title}" by ${sub.studentName}?`)) {
                                deleteActivity(sub.id);
                              }
                            }}
                            className="w-full py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Permanently delete this submission"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Delete Submission Record</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {modSubs.length === 0 && (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                      <p className="text-slate-500 text-sm">No records found matching the current module filters.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: POINT RULES & RANK RULES */}
        {activeAdminTab === 'point-rules' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Dynamic Point Rules & Rank Points</h1>
                <p className="text-xs text-slate-500 mt-1">Configure recommended and maximum academic points per category and position.</p>
              </div>
              <button
                onClick={() => setShowPointRuleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Point Rule
              </button>
            </div>

            {/* Point Rules Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
                Category & Activity Point Rules ({pointRules.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Activity Type</th>
                      <th className="py-3 px-4">Recommended</th>
                      <th className="py-3 px-4">Max Points</th>
                      <th className="py-3 px-4">Admin Note</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pointRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-800 uppercase text-[10px]">
                          {rule.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{rule.activityType}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{rule.recommendedPoints} pts</td>
                        <td className="py-3 px-4 text-slate-500">{rule.maxPoints} pts</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{rule.adminNote || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deletePointRule(rule.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rank Rules Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Rank-Based Points Multipliers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {rankRules.map((rk) => (
                  <div key={rk.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center relative group">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete rank multiplier rule "${rk.rankName}"?`)) {
                          deleteRankRule(rk.id);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                      title="Delete rank rule"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 block">{rk.rankName}</span>
                    <span className="text-lg font-black text-amber-600">+{rk.points}</span>
                    <span className="text-[10px] text-slate-400 block">points</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: POINT HISTORY LEDGER (WITH DYNAMIC CATEGORY TABS) */}
        {activeAdminTab === 'point-history' && (
          <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase tracking-wider">
                    Institutional Audit
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Tamper-evident ledger
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mt-1">Institutional Point Audit Ledger</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete chronological audit trail of all academic outreach points awarded, upgraded, or adjusted across categories.
                </p>
              </div>

              {/* Action Bar: Search, Sort & Export */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={ledgerSearchQuery}
                    onChange={(e) => setLedgerSearchQuery(e.target.value)}
                    placeholder="Search student, adm no, title, admin..."
                    className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 w-56 sm:w-64 shadow-2xs"
                  />
                  {ledgerSearchQuery && (
                    <button
                      onClick={() => setLedgerSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={ledgerSortOrder}
                    onChange={(e) => setLedgerSortOrder(e.target.value as any)}
                    className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="delta-desc">Highest Delta (+pts)</option>
                    <option value="final-desc">Highest Final Balance</option>
                  </select>
                </div>

                {/* Export Excel Button */}
                <button
                  onClick={() => {
                    const currentCategoryLabel =
                      ledgerCategoryTab === 'all'
                        ? 'All_Categories'
                        : dynamicLedgerCategories.find((c) => c.key === ledgerCategoryTab)?.label || ledgerCategoryTab;
                    exportPointHistoryLedgerExcel(currentCategoryLabel, filteredPointHistory);
                    showToast(`Exported ${filteredPointHistory.length} ledger entries to Excel.`, 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  title="Export Current Category Ledger to Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* DYNAMIC CATEGORY TABS BAR */}
            {/* As requested: "POINTS HISTORY LEDGER me CATEGORIES KA alag alag TAB hona hai jitna CATEGORIES hoka ya STUDENTS ADD Karega sab ka yahan ALAG ALAG TAB banna hai" */}
            <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Filter Ledger by Academic Category ({dynamicLedgerCategories.length} Categories Active)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Select a category tab to view its dedicated audit history & metrics
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 scrollbar-none">
                {/* ALL CATEGORIES TAB */}
                <button
                  type="button"
                  onClick={() => setLedgerCategoryTab('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                    ledgerCategoryTab === 'all'
                      ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      ledgerCategoryTab === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pointHistory.length}
                  </span>
                  <span
                    className={`text-[10px] font-black ${
                      ledgerCategoryTab === 'all' ? 'text-amber-300' : 'text-emerald-600'
                    }`}
                  >
                    +{pointHistory.reduce((sum, r) => sum + (r.pointsAdded || 0), 0)} pts
                  </span>
                </button>

                {/* DYNAMIC CATEGORY TABS (AUTOMATICALLY POPULATED FROM PRESETS, SUBMISSIONS & POINT HISTORY) */}
                {dynamicLedgerCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = ledgerCategoryTab === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setLedgerCategoryTab(cat.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cat.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.historyCount}
                      </span>
                      {cat.pointsTotal > 0 && (
                        <span
                          className={`text-[10px] font-black ${
                            isSelected ? 'text-amber-300' : 'text-emerald-600'
                          }`}
                        >
                          +{cat.pointsTotal} pts
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE CATEGORY SUMMARY METRICS BENTO */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    Points Conferred
                  </span>
                  <span className="text-xl font-black text-blue-700">
                    +{activeCategoryMetrics.totalPoints} pts
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    Audit Transactions
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {activeCategoryMetrics.totalRecords} Events
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    Benefited Students
                  </span>
                  <span className="text-xl font-black text-purple-700">
                    {activeCategoryMetrics.uniqueStudents} Scholars
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    Avg Points / Record
                  </span>
                  <span className="text-xl font-black text-amber-700">
                    {activeCategoryMetrics.avgPoints} pts
                  </span>
                </div>
              </div>
            </div>

            {/* POINT AUDIT LEDGER TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Showing {filteredPointHistory.length} of {pointHistory.length} records in{' '}
                    <span className="text-blue-700 font-extrabold">
                      {ledgerCategoryTab === 'all'
                        ? 'All Categories'
                        : dynamicLedgerCategories.find((c) => c.key === ledgerCategoryTab)?.label ||
                          ledgerCategoryTab}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {pointHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Permanently clear all records in the point history ledger?')) {
                          clearPointHistory();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Clear all point history records"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Clear Ledger</span>
                    </button>
                  )}
                  <span className="text-[11px] text-slate-400">
                    Live synchronized with student activity submissions
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Activity Record</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Delta</th>
                      <th className="py-3 px-4">Final Total</th>
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPointHistory.map((ph) => {
                      const matchedStudent = students.find((s) => s.id === ph.studentId);
                      const catMeta = dynamicLedgerCategories.find((c) => c.key === ph.category);
                      const CatIcon = catMeta?.icon || Sparkles;

                      return (
                        <tr key={ph.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Timestamp */}
                          <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(ph.date).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(ph.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>

                          {/* Student Info with Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  matchedStudent?.avatarUrl ||
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                                }
                                alt={ph.studentName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 leading-tight">{ph.studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {matchedStudent?.admissionNumber || 'ID: ' + ph.studentId.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Activity Title */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 max-w-xs truncate" title={ph.activityTitle}>
                              {ph.activityTitle}
                            </div>
                          </td>

                          {/* Category Badge with Icon */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                catMeta?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <CatIcon className="w-3 h-3" />
                              <span>{(ph.category || '').toUpperCase().replace(/_/g, ' ')}</span>
                            </span>
                          </td>

                          {/* Delta (+Points) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                                ph.pointsAdded >= 0
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : 'text-rose-700 bg-rose-50 border border-rose-200'
                              }`}
                            >
                              {ph.pointsAdded >= 0 ? `+${ph.pointsAdded}` : ph.pointsAdded}
                            </span>
                          </td>

                          {/* Final Cumulative Total */}
                          <td className="py-3.5 px-4 font-black text-blue-700 text-sm whitespace-nowrap">
                            {ph.finalPoints} pts
                          </td>

                          {/* Reviewer / Admin */}
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>{ph.adminName}</span>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={ph.reason}>
                            {ph.reason || 'Verified and approved.'}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedLedgerItem(ph)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 hover:border-blue-200"
                                title="View Full Audit Record"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete ledger audit record for "${ph.studentName}"?`)) {
                                    deletePointHistoryRecord(ph.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                title="Delete Ledger Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredPointHistory.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-slate-400">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <History className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-slate-700 text-sm">
                              No Point Audit Records Found
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {ledgerCategoryTab === 'all'
                                ? 'No points have been recorded in the ledger matching your search query.'
                                : `No points have been awarded yet under "${
                                    dynamicLedgerCategories.find((c) => c.key === ledgerCategoryTab)?.label ||
                                    ledgerCategoryTab
                                  }". When students submit activities in this category and they are approved by reviewers, they will automatically appear in this tab.`}
                            </p>
                            {ledgerSearchQuery && (
                              <button
                                onClick={() => setLedgerSearchQuery('')}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 cursor-pointer"
                              >
                                Clear Search Query
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: FEATURED STUDENT TITLES & HONORS */}
        {activeAdminTab === 'featured-titles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Featured Student Titles & Honors</h1>
                <p className="text-xs text-slate-500 mt-1">Confer unlimited custom titles (e.g. Best Writer, Best Orator) and manage their home page showcase order.</p>
              </div>
              <button
                onClick={() => {
                  setTitleName('Best Writer & Scholar');
                  setTitleStudentId(students[0]?.id || '');
                  setTitleDescription('Recognized for distinguished campus publications and research papers.');
                  setTitleSession('2025-2026');
                  setTitleSubtitle('Honorary Laureate');
                  setTitleOrder(featuredTitles.length + 1);
                  setTitleShowHome(true);
                  setShowTitleModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Confer New Title
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTitles.map((title) => (
                <div
                  key={title.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                        Order #{title.displayOrder}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        title.showOnHomePage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {title.showOnHomePage ? 'On Home Page' : 'Hidden'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={title.studentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                        alt={title.studentName || 'Student'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{title.title}</h4>
                        <p className="text-xs font-semibold text-blue-700">{title.studentName}</p>
                        <p className="text-[11px] text-slate-400">Session {title.sessionYear}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{title.shortDescription}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        saveFeaturedTitle({
                          ...title,
                          showOnHomePage: !title.showOnHomePage,
                        });
                      }}
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                    >
                      {title.showOnHomePage ? 'Hide from Home' : 'Show on Home'}
                    </button>
                    <button
                      onClick={() => deleteFeaturedTitle(title.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CAMPUS LEADERBOARD (ADMIN VIEW) */}
        {activeAdminTab === 'leaderboard-admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Campus Merit Leaderboard</h1>
                <p className="text-xs text-slate-500 mt-1">Calculated strictly from approved student achievements and points.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateSettings({
                      ...settings,
                      publicLeaderboard: !settings.publicLeaderboard,
                    })
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    settings.publicLeaderboard
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Public Leaderboard: {settings.publicLeaderboard ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => exportLeaderboardPDF(students, settings.organizationName)}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Export Leaderboard PDF
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Department / Course</th>
                      <th className="py-3 px-4">Approved Honors</th>
                      <th className="py-3 px-4 text-right">Total Verified Points</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-black text-amber-600 text-sm">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <img
                            src={std.avatarUrl}
                            alt={std.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900">{std.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{std.admissionNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{std.department}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">{std.approvedCount} Records</td>
                        <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">{std.totalPoints} pts</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete student "${std.name}" (${std.admissionNumber})? This permanently deletes their account and achievements.`)) {
                                deleteStudent(std.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CERTIFICATES & QR VERIFICATION */}
        {activeAdminTab === 'certificates-admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Certificates & QR Seals</h1>
                <p className="text-xs text-slate-500 mt-1">Confer tamper-proof diplomas and generate cryptographic QR codes.</p>
              </div>
              <button
                onClick={() => {
                  setCertStudentId(students[0]?.id || '');
                  setCertActivityId(submissions[0]?.id || '');
                  setCertDetails('Exceptional achievement in collegiate outreach.');
                  setShowCertModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Issue Certificate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-700">{cert.id}</span>
                      <span className="text-emerald-600 font-semibold text-[10px]">Verified</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{cert.activityTitle}</h4>
                    <p className="text-xs text-slate-600">Honoree: <span className="font-bold">{cert.studentName}</span> ({cert.studentAdmissionNo})</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{cert.achievementDetails}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setVerificationCertId(cert.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>
                      <button
                        onClick={() => exportCertificatePDF(cert, settings.organizationName, settings.logoUrl)}
                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        PDF
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Revoke and permanently delete certificate "${cert.id}" for ${cert.studentName}?`)) {
                          deleteCertificate(cert.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: REPORTS & EXPORTS */}
        {activeAdminTab === 'reports-admin' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Institutional Reports & Data Exports</h1>
              <p className="text-xs text-slate-500 mt-1">Export complete institutional records into formatted PDF and multi-sheet Excel files.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Complete Master Excel (.xlsx)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full institutional export containing Students, Activities, Point History, Point Rules, and Issued Certificates across dedicated sheets.
                </p>
                <button
                  onClick={() => exportAdminFullDataExcel(students, submissions, pointRules, certificates, pointHistory)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Download Master Excel
                </button>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Official Leaderboard PDF</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Formal printable standing roster featuring institutional crest, verified points, departments, and academic merit standings.
                </p>
                <button
                  onClick={() => exportLeaderboardPDF(students, settings.organizationName)}
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Download Leaderboard PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: AUDIT LOGS */}
        {activeAdminTab === 'audit-logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Administrative Audit Logs</h1>
                <p className="text-xs text-slate-500 mt-1">Security log tracking all administrative decisions, point modifications, and policy updates.</p>
              </div>
              {auditLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all administrative audit logs?')) {
                      clearAuditLogs();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Audit Logs</span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Admin Author</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-700">{log.adminName}</td>
                        <td className="py-3 px-4 text-slate-600">{log.details}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this audit log record?')) {
                                deleteAuditLog(log.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No audit log entries recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: SETTINGS & BRANDING */}
        {activeAdminTab === 'settings-admin' && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl font-bold text-slate-900">Institutional Settings & Branding</h1>
              <p className="text-xs text-slate-500 mt-1">Configure institution details, logo replacement, public toggles, and administrator credentials.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Organization Name</label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) => updateSettings({ ...settings, organizationName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Platform Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Institutional Campus</span>
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => updateSettings({ ...settings, address: e.target.value })}
                    placeholder="Darul Huda Islamic University, Chemmad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Outreach Secretariat (Phone)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ ...settings, phone: e.target.value })}
                    placeholder="8521367782"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Verification Desk (Email)</span>
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ ...settings, email: e.target.value })}
                    placeholder="outreach@dhiu.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Upload / Replace Institution Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const b64 = await fileToBase64(e.target.files[0]);
                      updateSettings({ ...settings, logoUrl: b64 });
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
                />
                {settings.logoUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => updateSettings({ ...settings, logoUrl: '' })}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Admin Username</label>
                  <input
                    type="text"
                    value={settings.adminUsername}
                    onChange={(e) => updateSettings({ ...settings, adminUsername: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Admin Password</label>
                  <input
                    type="text"
                    value={settings.adminPasswordHash}
                    onChange={(e) => updateSettings({ ...settings, adminPasswordHash: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-blue-950 text-xs">Front Page & Hero Customization</h4>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Edit the homepage hero banner, headlines, badges, descriptions, and CTA buttons with live preview.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('front-page-admin')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </button>
                </div>

                <h4 className="font-bold text-slate-900">Public Visibility Toggles</h4>
                
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-slate-700 font-semibold">Public Leaderboard Visibility</span>
                  <input
                    type="checkbox"
                    checked={settings.publicLeaderboard}
                    onChange={(e) => updateSettings({ ...settings, publicLeaderboard: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-slate-700 font-semibold">Featured Students Section on Home Page</span>
                  <input
                    type="checkbox"
                    checked={settings.featuredStudentsSection}
                    onChange={(e) => updateSettings({ ...settings, featuredStudentsSection: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-slate-700 font-semibold">Public Publications Gallery</span>
                  <input
                    type="checkbox"
                    checked={settings.publicPublications}
                    onChange={(e) => updateSettings({ ...settings, publicPublications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <div className="pt-4 border-t border-slate-200">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-white text-xs">Supabase Cloud Database & Storage</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('supabase-admin')}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Manage Connection</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <p className="text-[10px] text-slate-400">Database Engine</p>
                        <p className="font-semibold text-white">Supabase PostgreSQL</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        <p className="text-[10px] text-slate-400">Media Optimizer</p>
                        <p className="font-semibold text-emerald-300">50–80 KB Auto-Compression</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      All text records, publications, and student uploads are saved directly to Supabase with image files optimized to 50–80 KB and saved as public URLs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUPABASE CLOUD & STORAGE TAB */}
        {activeAdminTab === 'supabase-admin' && (
          <AdminSupabaseTab />
        )}

      </main>

      {/* MODAL 1: REVIEW SUBMISSION (APPROVE / REJECT / CORRECTION) */}
      {selectedSubForReview && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div
              className={`p-6 text-white relative ${
                reviewAction === 'approve'
                  ? 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900'
                  : reviewAction === 'correction'
                  ? 'bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900'
                  : 'bg-gradient-to-r from-rose-900 via-red-950 to-slate-900'
              }`}
            >
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                  {reviewAction === 'approve'
                    ? 'Official Approval'
                    : reviewAction === 'correction'
                    ? 'Student Direct Message & Issue'
                    : 'Official Rejection'}
                </span>
                <span className="text-white/70 text-xs">
                  {selectedSubForReview.category.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-black leading-snug">{selectedSubForReview.title}</h3>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Student: <span className="text-white font-bold">{selectedSubForReview.studentName}</span> (Adm: {selectedSubForReview.studentAdmissionNo})
              </p>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Proof Image / Document if available */}
              {selectedSubForReview.imageUrl && (
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  <img src={selectedSubForReview.imageUrl} alt="Proof" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Sub Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-700 text-xs">
                  <span>Abstract / Description:</span>
                  <span className="text-[11px] text-slate-400 font-normal">Date: {selectedSubForReview.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedSubForReview.description}</p>
                {selectedSubForReview.venueOrOrganizer && (
                  <p className="text-[11px] text-slate-500 pt-1 font-medium">
                    <span className="font-bold text-slate-700">Venue / Journal / Organizer:</span> {selectedSubForReview.venueOrOrganizer}
                  </p>
                )}
              </div>

              {/* Approval Mode - Points Allocation */}
              {reviewAction === 'approve' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <label className="font-bold text-emerald-900 flex items-center justify-between text-xs">
                    <span>Award Academic Merit Points</span>
                    <span className="text-emerald-700 text-[11px]">Recommended benchmark: {selectedSubForReview.recommendedPoints} pts</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={reviewPoints}
                    onChange={(e) => setReviewPoints(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 font-black text-lg text-emerald-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Correction / Messaging Mode - Student Communication Info Banner */}
              {reviewAction === 'correction' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1.5 text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                    <span>Message to Student regarding Issues with this Submission</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    This note will be sent directly to the student portal and highlighted on their dashboard, informing them what issue needs to be addressed before approval.
                  </p>
                </div>
              )}

              {/* Rejection Mode - Warning Banner */}
              {reviewAction === 'reject' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-950">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    <span>Rejection Notice Requirement</span>
                  </div>
                  <p className="text-rose-800 text-[11px] leading-relaxed">
                    Please provide an official justification explaining why this submission cannot be accepted under the institutional outreach guidelines.
                  </p>
                </div>
              )}

              {/* Feedback / Note Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>
                    {reviewAction === 'approve'
                      ? 'Approval Commendation Note (Optional)'
                      : reviewAction === 'correction'
                      ? 'Message to Student (Specify Issue / Correction Needed) *'
                      : 'Official Rejection Reason *'}
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewAction === 'approve'
                      ? 'e.g. Verified by Academic Committee. Exemplary contribution to institutional outreach.'
                      : reviewAction === 'correction'
                      ? 'e.g. Certificate image is blurry. Please upload a clear scanned copy of the first page with DOI/ISSN number visible.'
                      : 'e.g. Activity falls outside recognized accreditation rubric dates or lacks institutional verification seal.'
                  }
                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Permanently delete submission "${selectedSubForReview.title}" by ${selectedSubForReview.studentName}? This will remove it from Supabase and the database.`)) {
                    deleteActivity(selectedSubForReview.id);
                    setSelectedSubForReview(null);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Permanently delete this submission"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Submission</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubForReview(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  className={`px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-2 transition-all ${
                    reviewAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : reviewAction === 'correction'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {reviewAction === 'approve' && <CheckCircle2 className="w-4 h-4" />}
                  {reviewAction === 'correction' && <MessageSquare className="w-4 h-4" />}
                  {reviewAction === 'reject' && <XCircle className="w-4 h-4" />}
                  <span>
                    {reviewAction === 'approve'
                      ? `Approve & Award ${reviewPoints} Pts`
                      : reviewAction === 'correction'
                      ? 'Send Message & Request Fix'
                      : 'Confirm Rejection'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT STUDENT */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">{editingStudent ? 'Edit Student Account' : 'Enroll New Student'}</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentFormName}
                  onChange={(e) => setStudentFormName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Unique Admission No *</label>
                  <input
                    type="text"
                    required
                    value={studentFormAdmNo}
                    onChange={(e) => setStudentFormAdmNo(e.target.value.toUpperCase())}
                    placeholder="ADM2026-001"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Institutional Email</label>
                  <input
                    type="email"
                    value={studentFormEmail}
                    onChange={(e) => setStudentFormEmail(e.target.value)}
                    placeholder="student@dhiu.in"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Permanent Address / Location</span>
                </label>
                <input
                  type="text"
                  value={studentFormAddress}
                  onChange={(e) => setStudentFormAddress(e.target.value)}
                  placeholder="e.g. Kishanganj, Bihar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Course / Degree</label>
                  <input
                    type="text"
                    required
                    value={studentFormCourse}
                    onChange={(e) => setStudentFormCourse(e.target.value)}
                    placeholder="B.A. English Literature"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    required
                    value={studentFormDept}
                    onChange={(e) => setStudentFormDept(e.target.value)}
                    placeholder="Humanities & Languages"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Academic Batch</label>
                <input
                  type="text"
                  value={studentFormBatch}
                  onChange={(e) => setStudentFormBatch(e.target.value)}
                  placeholder="2023-2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Profile Photo (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const b64 = await fileToBase64(e.target.files[0]);
                      setStudentFormAvatar(b64);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Short Bio / Achievements Summary</label>
                <textarea
                  rows={2}
                  value={studentFormBio}
                  onChange={(e) => setStudentFormBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFER FEATURED TITLE */}
      {showTitleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Confer Featured Student Title</h3>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Title Name *</label>
              <input
                type="text"
                required
                value={titleName}
                onChange={(e) => setTitleName(e.target.value)}
                placeholder="e.g. Best Writer & Literary Achiever"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Assign to Student *</label>
              <select
                value={titleStudentId}
                onChange={(e) => setTitleStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.admissionNumber}) - {s.course}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Session Year</label>
                <input
                  type="text"
                  value={titleSession}
                  onChange={(e) => setTitleSession(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Display Order</label>
                <input
                  type="number"
                  min={1}
                  value={titleOrder}
                  onChange={(e) => setTitleOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Short Achievement Citation</label>
              <textarea
                rows={2}
                value={titleDescription}
                onChange={(e) => setTitleDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={titleShowHome}
                onChange={(e) => setTitleShowHome(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="font-semibold text-slate-700">Showcase prominently on Home Page</span>
            </label>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTitleModal(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetStd = students.find((s) => s.id === titleStudentId);
                  await saveFeaturedTitle({
                    id: `ft-${Date.now()}`,
                    title: titleName,
                    studentId: titleStudentId,
                    studentName: targetStd?.name,
                    studentAdmissionNo: targetStd?.admissionNumber,
                    studentDepartment: targetStd?.department,
                    studentCourse: targetStd?.course,
                    studentAvatarUrl: targetStd?.avatarUrl,
                    shortDescription: titleDescription,
                    sessionYear: titleSession,
                    positionSubtitle: titleSubtitle,
                    displayOrder: titleOrder,
                    isFeatured: true,
                    isActive: true,
                    showOnHomePage: titleShowHome,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                  setShowTitleModal(false);
                }}
                className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold cursor-pointer"
              >
                Confer Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Issue Verified Certificate</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Select Student</label>
              <select
                value={certStudentId}
                onChange={(e) => setCertStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Achievement Record</label>
              <select
                value={certActivityId}
                onChange={(e) => setCertActivityId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              >
                {submissions
                  .filter((s) => !certStudentId || s.studentId === certStudentId)
                  .map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title} ({sub.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Citation / Achievement Details</label>
              <textarea
                rows={3}
                value={certDetails}
                onChange={(e) => setCertDetails(e.target.value)}
                placeholder="Details printed on official certificate..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetStd = students.find((s) => s.id === certStudentId) || students[0];
                  const targetSub = submissions.find((s) => s.id === certActivityId) || submissions[0];

                  await issueNewCertificate({
                    studentId: targetStd.id,
                    studentName: targetStd.name,
                    studentAdmissionNo: targetStd.admissionNumber,
                    activityId: targetSub.id,
                    activityTitle: targetSub.title,
                    category: targetSub.category,
                    achievementDetails: certDetails || targetSub.description,
                    issueDate: new Date().toISOString().split('T')[0],
                    organizationName: settings.organizationName,
                    pointsAwarded: targetSub.awardedPoints || 25,
                  });
                  setShowCertModal(false);
                }}
                className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Confer & Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD POINT RULE */}
      {showPointRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Add Academic Point Rule</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Category</label>
              <select
                value={ruleCategory}
                onChange={(e) => setRuleCategory(e.target.value as ActivityCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                <option value="publication">Publications</option>
                <option value="paper_presentation">Paper Presentation</option>
                <option value="seminar">Seminar</option>
                <option value="college_program">College Program</option>
                <option value="outside_program">Outside College Program</option>
                <option value="competition">Competition</option>
                <option value="award">Award</option>
                <option value="other_activity">Other Activity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Activity Type / Subtype *</label>
              <input
                type="text"
                required
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                placeholder="e.g. Scopus Journal Article, State Debate..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Recommended Points</label>
                <input
                  type="number"
                  min={1}
                  value={ruleRecPoints}
                  onChange={(e) => setRuleRecPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Max Cap Points</label>
                <input
                  type="number"
                  min={1}
                  value={ruleMaxPoints}
                  onChange={(e) => setRuleMaxPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Admin Guidance Note</label>
              <input
                type="text"
                value={ruleNote}
                onChange={(e) => setRuleNote(e.target.value)}
                placeholder="Guidelines for reviewers..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPointRuleModal(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!ruleType.trim()) {
                    showToast('Please specify activity type.', 'error');
                    return;
                  }
                  await savePointRule({
                    id: `pr-${Date.now()}`,
                    category: ruleCategory,
                    activityType: ruleType,
                    recommendedPoints: ruleRecPoints,
                    maxPoints: ruleMaxPoints,
                    isActive: true,
                    adminNote: ruleNote,
                  });
                  setShowPointRuleModal(false);
                  setRuleType('');
                }}
                className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: POINT AUDIT TRANSACTION DETAIL */}
      {selectedLedgerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Audit Transaction Record</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {selectedLedgerItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLedgerItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info Card */}
            {(() => {
              const std = students.find((s) => s.id === selectedLedgerItem.studentId);
              return (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                  <img
                    src={std?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt={selectedLedgerItem.studentName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-slate-900">{selectedLedgerItem.studentName}</div>
                    <div className="text-slate-500 flex items-center gap-2">
                      <span className="font-mono">{std?.admissionNumber || selectedLedgerItem.studentId}</span>
                      <span>•</span>
                      <span>{std?.course || 'Scholar'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{std?.department}</div>
                  </div>
                </div>
              );
            })()}

            {/* Transaction Math Breakdown */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
              <span className="text-[10px] text-blue-800 uppercase font-extrabold tracking-wider block">
                Point Computation Breakdown
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Previous Balance</span>
                  <span className="text-sm font-black text-slate-700">
                    {selectedLedgerItem.previousPoints ?? 0} pts
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Delta Conferred</span>
                  <span className="text-sm font-black text-emerald-600">
                    +{selectedLedgerItem.pointsAdded} pts
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Final Cumulative</span>
                  <span className="text-sm font-black text-blue-700">
                    {selectedLedgerItem.finalPoints} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Details Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Category</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedLedgerItem.category.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Timestamp</span>
                <span className="font-mono text-slate-800">
                  {new Date(selectedLedgerItem.date).toLocaleString()}
                </span>
              </div>
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Activity Record</span>
                <span className="font-semibold text-slate-800">
                  {selectedLedgerItem.activityTitle}
                </span>
              </div>
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Reviewer / Committee</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">{selectedLedgerItem.adminName}</span>
                </div>
              </div>
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Audit Reason / Committee Note</span>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  {selectedLedgerItem.reason || 'Verified and approved by Academic Review Committee.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLedgerItem(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
