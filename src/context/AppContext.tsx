/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  ActivitySubmission,
  PointRule,
  RankPointRule,
  PointHistoryRecord,
  FeaturedStudentTitle,
  AchievementBadge,
  IssuedCertificate,
  AppNotification,
  AuditLog,
  AppSettings,
  Announcement,
  UserRole,
  SubmissionStatus,
} from '../types';
import {
  getAllFromStore,
  putInStore,
  putManyInStore,
  deleteFromStore,
  STORES,
  clearEntireStore,
} from '../lib/db';
import {
  INITIAL_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_POINT_RULES,
  INITIAL_RANK_RULES,
  INITIAL_POINT_HISTORY,
  INITIAL_FEATURED_TITLES,
  INITIAL_BADGES,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
} from '../lib/initialData';
import {
  fireScholarCelebration,
  fireAchievementCelebration,
  fireCertificateCelebration,
  fireConfetti,
} from '../lib/confetti';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  userRole: UserRole;
  currentStudent: Student | null;
  activeView: string;
  activeAdminTab: string;
  activeStudentTab: string;
  setActiveView: (view: string) => void;
  setActiveAdminTab: (tab: string) => void;
  setActiveStudentTab: (tab: string) => void;
  
  // Data lists
  students: Student[];
  submissions: ActivitySubmission[];
  pointRules: PointRule[];
  rankRules: RankPointRule[];
  pointHistory: PointHistoryRecord[];
  featuredTitles: FeaturedStudentTitle[];
  badges: AchievementBadge[];
  certificates: IssuedCertificate[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  announcements: Announcement[];
  loading: boolean;
  
  // Modals & Triggers
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
  showStudentLoginModal: boolean;
  setShowStudentLoginModal: (show: boolean) => void;
  verificationCertId: string | null;
  setVerificationCertId: (certId: string | null) => void;
  triggerLogoClick: () => void;
  logoClickCount: number;

  // Toast
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Auth
  loginAsStudent: (admissionNumber: string, directStudent?: Student) => boolean;
  loginAsAdmin: (user: string, pass: string) => boolean;
  logout: () => void;

  // Actions
  submitActivity: (subData: Partial<ActivitySubmission>, isDraft?: boolean) => Promise<ActivitySubmission>;
  updateActivity: (subData: ActivitySubmission) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  approveActivity: (id: string, awardedPoints: number, reviewNote?: string) => Promise<void>;
  rejectActivity: (id: string, reason: string) => Promise<void>;
  requestCorrectionActivity: (id: string, reason: string) => Promise<void>;
  toggleFeatureActivity: (id: string) => Promise<void>;

  // Student CRUD
  addStudent: (student: Omit<Student, 'id' | 'totalPoints' | 'approvedCount' | 'pendingCount' | 'createdAt'>) => Promise<Student>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  toggleStudentStatus: (id: string) => Promise<void>;

  // Point & Rank Rules
  savePointRule: (rule: PointRule) => Promise<void>;
  deletePointRule: (id: string) => Promise<void>;
  saveRankRule: (rule: RankPointRule) => Promise<void>;
  deleteRankRule: (id: string) => Promise<void>;

  // Featured Titles
  saveFeaturedTitle: (title: FeaturedStudentTitle) => Promise<void>;
  deleteFeaturedTitle: (id: string) => Promise<void>;

  // Badges & Certificates
  saveBadge: (badge: AchievementBadge) => Promise<void>;
  deleteBadge: (id: string) => Promise<void>;
  issueNewCertificate: (cert: Omit<IssuedCertificate, 'id' | 'verificationHash'>) => Promise<IssuedCertificate>;

  // Settings & DB Reset
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  resetDatabaseToDefault: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeView, setActiveView] = useState<string>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [activeStudentTab, setActiveStudentTab] = useState<string>('overview');

  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>([]);
  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [rankRules, setRankRules] = useState<RankPointRule[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryRecord[]>([]);
  const [featuredTitles, setFeaturedTitles] = useState<FeaturedStudentTitle[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Hidden admin login 4-click detection
  const [logoClickCount, setLogoClickCount] = useState<number>(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showStudentLoginModal, setShowStudentLoginModal] = useState<boolean>(false);
  const [verificationCertId, setVerificationCertId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Check URL hash on load for #verify/ID
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#verify/')) {
        const certId = decodeURIComponent(hash.replace('#verify/', ''));
        setVerificationCertId(certId);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Recalculate student points and ranks with stable tie-breaking and safe state updates
  const syncStudentPointsAndRanks = useCallback(
    async (currentSubs: ActivitySubmission[], currentStudents: Student[]) => {
      const updated = currentStudents.map((std) => {
        const stdSubs = currentSubs.filter((s) => s.studentId === std.id);
        const approvedSubs = stdSubs.filter((s) => s.status === 'approved');
        const pendingSubs = stdSubs.filter((s) => s.status === 'pending');
        const totalPts = approvedSubs.reduce((acc, curr) => acc + (curr.awardedPoints || 0), 0);

        return {
          ...std,
          totalPoints: totalPts,
          approvedCount: approvedSubs.length,
          pendingCount: pendingSubs.length,
        };
      });

      // Sort by points descending to assign dynamic campus ranks with stable tie-breaker
      const sorted = [...updated].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.admissionNumber.localeCompare(b.admissionNumber);
      });

      const withRanks = sorted.map((std, idx) => ({
        ...std,
        rank: idx + 1,
      }));

      setStudents(withRanks);
      await putManyInStore(STORES.STUDENTS, withRanks);

      // Also update currentStudent safely without causing dependency churn or infinite loop
      setCurrentStudent((prev) => {
        if (!prev) return null;
        const me = withRanks.find((s) => s.id === prev.id);
        if (!me) return prev;
        if (
          prev.totalPoints === me.totalPoints &&
          prev.rank === me.rank &&
          prev.approvedCount === me.approvedCount &&
          prev.pendingCount === me.pendingCount &&
          prev.name === me.name &&
          prev.avatarUrl === me.avatarUrl &&
          prev.isActive === me.isActive
        ) {
          return prev;
        }
        return me;
      });
    },
    []
  );

  // Initial Load from IndexedDB or seed with initial demo data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let storedStudents = await getAllFromStore<Student>(STORES.STUDENTS);
        
        if (!storedStudents || storedStudents.length === 0) {
          // Empty DB: Seed with our comprehensive initial demo data
          console.log('IndexedDB is empty, seeding initial institutional data...');
          await putManyInStore(STORES.STUDENTS, INITIAL_STUDENTS);
          await putManyInStore(STORES.SUBMISSIONS, INITIAL_SUBMISSIONS);
          await putManyInStore(STORES.POINT_RULES, INITIAL_POINT_RULES);
          await putManyInStore(STORES.RANK_RULES, INITIAL_RANK_RULES);
          await putManyInStore(STORES.POINT_HISTORY, INITIAL_POINT_HISTORY);
          await putManyInStore(STORES.FEATURED_TITLES, INITIAL_FEATURED_TITLES);
          await putManyInStore(STORES.BADGES, INITIAL_BADGES);
          await putManyInStore(STORES.CERTIFICATES, INITIAL_CERTIFICATES);
          await putManyInStore(STORES.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
          await putManyInStore(STORES.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
          await putManyInStore(STORES.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
          await putInStore(STORES.SETTINGS, { ...INITIAL_SETTINGS, id: 'main_settings' });

          setStudents(INITIAL_STUDENTS);
          setSubmissions(INITIAL_SUBMISSIONS);
          setPointRules(INITIAL_POINT_RULES);
          setRankRules(INITIAL_RANK_RULES);
          setPointHistory(INITIAL_POINT_HISTORY);
          setFeaturedTitles(INITIAL_FEATURED_TITLES);
          setBadges(INITIAL_BADGES);
          setCertificates(INITIAL_CERTIFICATES);
          setAuditLogs(INITIAL_AUDIT_LOGS);
          setNotifications(INITIAL_NOTIFICATIONS);
          setAnnouncements(INITIAL_ANNOUNCEMENTS);
          setSettings(INITIAL_SETTINGS);
        } else {
          // Load stored data
          const [
            loadedSubs,
            loadedPointRules,
            loadedRankRules,
            loadedHistory,
            loadedFeatured,
            loadedBadges,
            loadedCerts,
            loadedNotifs,
            loadedAudit,
            loadedSettings,
            loadedAnnouncements,
          ] = await Promise.all([
            getAllFromStore<ActivitySubmission>(STORES.SUBMISSIONS),
            getAllFromStore<PointRule>(STORES.POINT_RULES),
            getAllFromStore<RankPointRule>(STORES.RANK_RULES),
            getAllFromStore<PointHistoryRecord>(STORES.POINT_HISTORY),
            getAllFromStore<FeaturedStudentTitle>(STORES.FEATURED_TITLES),
            getAllFromStore<AchievementBadge>(STORES.BADGES),
            getAllFromStore<IssuedCertificate>(STORES.CERTIFICATES),
            getAllFromStore<AppNotification>(STORES.NOTIFICATIONS),
            getAllFromStore<AuditLog>(STORES.AUDIT_LOGS),
            getAllFromStore<AppSettings & { id: string }>(STORES.SETTINGS),
            getAllFromStore<Announcement>(STORES.ANNOUNCEMENTS),
          ]);

          // Ensure all predefined students with their avatars and portfolios are preserved and purge old domains
          let studentsToSave = false;
          const updatedStudents = storedStudents.map((s) => {
            if (s.email && s.email.includes('@imperial.edu')) {
              studentsToSave = true;
              return { ...s, email: s.email.replace('@imperial.edu', '@dhiu.in') };
            }
            return s;
          });
          if (studentsToSave) {
            await putManyInStore(STORES.STUDENTS, updatedStudents);
            storedStudents = updatedStudents;
          }

          const existingStudentIds = new Set(storedStudents.map((s) => s.id));
          const missingStudents = INITIAL_STUDENTS.filter((s) => !existingStudentIds.has(s.id));
          if (missingStudents.length > 0) {
            await putManyInStore(STORES.STUDENTS, missingStudents);
            storedStudents.push(...missingStudents);
          }

          // Ensure all submissions with their photos, articles, and proof certificates are preserved
          const allSubs = loadedSubs || [];
          const existingSubIds = new Set(allSubs.map((s) => s.id));
          const missingSubs = INITIAL_SUBMISSIONS.filter((s) => !existingSubIds.has(s.id));
          if (missingSubs.length > 0) {
            await putManyInStore(STORES.SUBMISSIONS, missingSubs);
            allSubs.push(...missingSubs);
          }

          // Ensure announcements are loaded and permanent INITIAL_ANNOUNCEMENTS (Monthly Assembly) is preserved
          let finalAnnouncements: Announcement[] = [];
          if (!loadedAnnouncements || loadedAnnouncements.length === 0) {
            await putManyInStore(STORES.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
            finalAnnouncements = INITIAL_ANNOUNCEMENTS;
          } else {
            const existingAnnIds = new Set(loadedAnnouncements.map((a) => a.id));
            const missingAnns = INITIAL_ANNOUNCEMENTS.filter((a) => !existingAnnIds.has(a.id));
            if (missingAnns.length > 0) {
              await putManyInStore(STORES.ANNOUNCEMENTS, missingAnns);
              finalAnnouncements = [...loadedAnnouncements, ...missingAnns];
            } else {
              finalAnnouncements = loadedAnnouncements;
            }
          }

          // Ensure featured titles, badges, certificates exist
          const finalFeatured = loadedFeatured?.length ? loadedFeatured : INITIAL_FEATURED_TITLES;
          if (!loadedFeatured?.length) await putManyInStore(STORES.FEATURED_TITLES, INITIAL_FEATURED_TITLES);

          const finalBadges = loadedBadges?.length ? loadedBadges : INITIAL_BADGES;
          if (!loadedBadges?.length) await putManyInStore(STORES.BADGES, INITIAL_BADGES);

          const finalCerts = loadedCerts?.length ? loadedCerts : INITIAL_CERTIFICATES;
          if (!loadedCerts?.length) await putManyInStore(STORES.CERTIFICATES, INITIAL_CERTIFICATES);

          setStudents(storedStudents);
          setSubmissions(allSubs);
          setPointRules(loadedPointRules.length ? loadedPointRules : INITIAL_POINT_RULES);
          setRankRules(loadedRankRules.length ? loadedRankRules : INITIAL_RANK_RULES);
          setPointHistory(loadedHistory);
          setFeaturedTitles(finalFeatured);
          setBadges(finalBadges);
          setCertificates(finalCerts);
          setNotifications(loadedNotifs);
          setAuditLogs(loadedAudit);
          setAnnouncements(finalAnnouncements.sort((a, b) => a.displayOrder - b.displayOrder));

          if (loadedSettings.length > 0) {
            const current = loadedSettings[0];
            const updated: AppSettings = {
              ...INITIAL_SETTINGS,
              ...current,
              address:
                !current.address || current.address.includes('Academic Enclave') || current.address.includes('Knowledge Park')
                  ? INITIAL_SETTINGS.address
                  : current.address,
              phone:
                !current.phone || current.phone.includes('456-7890') || current.phone.includes('+1 (800)')
                  ? INITIAL_SETTINGS.phone
                  : current.phone,
              email:
                !current.email || current.email.includes('imperialcollege.edu') || current.email.includes('imperial')
                  ? INITIAL_SETTINGS.email
                  : current.email,
              website:
                !current.website || current.website.includes('imperialcollege.edu') || current.website.includes('imperial')
                  ? INITIAL_SETTINGS.website
                  : current.website,
              showAnnouncementBar: true,
              announcementBarText:
                current.announcementBarText &&
                current.announcementBarText !== 'Welcome to the Official Academic Achievement & Outreach Portal 2025-2026'
                  ? current.announcementBarText
                  : INITIAL_SETTINGS.announcementBarText,
              heroHeadingPrefix:
                !current.heroHeadingPrefix || current.heroHeadingPrefix === 'Students Outreach Management'
                  ? 'Students Outreach'
                  : current.heroHeadingPrefix,
              heroHeadingHighlight:
                !current.heroHeadingHighlight || current.heroHeadingHighlight === 'Software'
                  ? 'Dashboard'
                  : current.heroHeadingHighlight,
              tagline: current.tagline?.includes('Management Software')
                ? current.tagline.replace('Management Software', 'Dashboard')
                : (current.tagline || INITIAL_SETTINGS.tagline),
            };
            setSettings(updated);
            await putInStore(STORES.SETTINGS, { ...updated, id: 'main_settings' });
          } else {
            setSettings(INITIAL_SETTINGS);
            await putInStore(STORES.SETTINGS, { ...INITIAL_SETTINGS, id: 'main_settings' });
          }

          // Ensure student points and ranks stay strictly synchronized
          await syncStudentPointsAndRanks(allSubs, storedStudents);
        }

        // Check if there was a saved session
        const savedSession = sessionStorage.getItem('soms_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.role === 'admin') {
            setUserRole('admin');
            setActiveView('admin-panel');
          } else if (parsed.role === 'student' && parsed.studentId) {
            const allStds = storedStudents.length ? storedStudents : INITIAL_STUDENTS;
            const found = allStds.find((s) => s.id === parsed.studentId);
            if (found && found.isActive) {
              setUserRole('student');
              setCurrentStudent(found);
              setActiveView('student-portal');
            }
          }
        }
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle Logo 4-Clicks trigger for Secret Admin Login
  const triggerLogoClick = () => {
    if (clickTimer) clearTimeout(clickTimer);

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (newCount >= 4) {
      setLogoClickCount(0);
      setShowAdminLoginModal(true);
      showToast('Admin access portal detected.', 'info');
    } else {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 2500); // 2.5s window for consecutive clicks
      setClickTimer(timer);
    }
  };

  // Helper to append audit log
  const logAudit = async (action: string, details: string, recordType?: string, recordId?: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      adminName: userRole === 'admin' ? settings.adminUsername : 'student',
      details,
      timestamp: new Date().toISOString(),
      recordType,
      recordId,
    };
    setAuditLogs((prev) => [log, ...prev]);
    await putInStore(STORES.AUDIT_LOGS, log);
  };

  // Auth: Student Login by Admission Number
  const loginAsStudent = (admissionNumber: string, directStudent?: Student): boolean => {
    const cleanNo = admissionNumber.trim().toUpperCase();
    const found =
      directStudent ||
      students.find(
        (s) => s.admissionNumber.trim().toUpperCase() === cleanNo && s.isActive
      );

    if (found) {
      setUserRole('student');
      setCurrentStudent(found);
      setActiveView('student-portal');
      setActiveStudentTab('overview');
      sessionStorage.setItem(
        'soms_session',
        JSON.stringify({ role: 'student', studentId: found.id })
      );
      showToast(`Welcome back, ${found.name}!`, 'success');
      return true;
    }

    showToast('Invalid admission number or account is deactivated.', 'error');
    return false;
  };

  // Auth: Admin Login
  const loginAsAdmin = (user: string, pass: string): boolean => {
    const trimmedUser = user.trim();
    if (
      trimmedUser.toLowerCase() === settings.adminUsername.toLowerCase() &&
      pass === settings.adminPasswordHash
    ) {
      setUserRole('admin');
      setActiveView('admin-panel');
      setActiveAdminTab('dashboard');
      sessionStorage.setItem('soms_session', JSON.stringify({ role: 'admin' }));
      showToast('Authenticated as Administrator.', 'success');
      logAudit('ADMIN_LOGIN', 'Administrator logged in successfully.');
      return true;
    }

    showToast('Invalid administrator username or password.', 'error');
    return false;
  };

  const logout = () => {
    setUserRole('guest');
    setCurrentStudent(null);
    setActiveView('home');
    sessionStorage.removeItem('soms_session');
    showToast('Logged out successfully.', 'info');
  };

  // Submissions Actions
  const submitActivity = async (
    subData: Partial<ActivitySubmission>,
    isDraft: boolean = false
  ): Promise<ActivitySubmission> => {
    if (!currentStudent && userRole !== 'admin') {
      throw new Error('You must be logged in as a student to submit an activity.');
    }

    const studentInfo = currentStudent || {
      id: subData.studentId || 'admin-created',
      name: subData.studentName || 'Student',
      admissionNumber: subData.studentAdmissionNo || 'ADM-000',
      course: subData.studentCourse || 'Academic Program',
      department: subData.studentDepartment || 'Institutional Dept',
    };

    const newSub: ActivitySubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: studentInfo.id,
      studentName: studentInfo.name,
      studentAdmissionNo: studentInfo.admissionNumber,
      studentCourse: studentInfo.course,
      studentDepartment: studentInfo.department,
      category: subData.category || 'other_activity',
      subType: subData.subType || '',
      title: subData.title || 'Untitled Submission',
      status: isDraft ? 'draft' : 'pending',
      date: subData.date || new Date().toISOString().split('T')[0],
      description: subData.description || '',
      venueOrOrganizer: subData.venueOrOrganizer || '',
      externalLink: subData.externalLink || '',
      participationRank: subData.participationRank || '',
      participationType: subData.participationType || '',
      imageUrl: subData.imageUrl || '',
      certificateUrl: subData.certificateUrl || '',
      supportingDocUrl: subData.supportingDocUrl || '',
      supportingDocName: subData.supportingDocName || '',
      recommendedPoints: subData.recommendedPoints || 10,
      awardedPoints: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSubs = [newSub, ...submissions];
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, newSub);

    // Notify Admin
    if (!isDraft) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'admin',
        title: 'New Student Submission',
        message: `${studentInfo.name} submitted ${newSub.category.replace('_', ' ')}: "${newSub.title}".`,
        type: 'info',
        relatedActivityId: newSub.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
      await putInStore(STORES.NOTIFICATIONS, notif);
    }

    await syncStudentPointsAndRanks(nextSubs, students);
    showToast(isDraft ? 'Draft saved locally.' : 'Activity submitted for Admin verification.', 'success');
    if (!isDraft) {
      fireAchievementCelebration();
    }
    return newSub;
  };

  const updateActivity = async (subData: ActivitySubmission): Promise<void> => {
    const updated = { ...subData, updatedAt: new Date().toISOString() };
    const nextSubs = submissions.map((s) => (s.id === subData.id ? updated : s));
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, updated);
    await syncStudentPointsAndRanks(nextSubs, students);
    showToast('Activity record updated.', 'success');
  };

  const deleteActivity = async (id: string): Promise<void> => {
    const sub = submissions.find((s) => s.id === id);
    const nextSubs = submissions.filter((s) => s.id !== id);
    setSubmissions(nextSubs);
    await deleteFromStore(STORES.SUBMISSIONS, id);
    await syncStudentPointsAndRanks(nextSubs, students);
    if (sub) {
      await logAudit('DELETE_ACTIVITY', `Deleted activity "${sub.title}" of student ${sub.studentName}`, 'submission', id);
    }
    showToast('Submission deleted.', 'info');
  };

  const approveActivity = async (id: string, awardedPoints: number, reviewNote?: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const prevAwarded = sub.awardedPoints || 0;
    const pointsDelta = awardedPoints - prevAwarded;

    const updatedSub: ActivitySubmission = {
      ...sub,
      status: 'approved',
      awardedPoints,
      adminReviewNote: reviewNote || 'Approved by academic review committee.',
      reviewedBy: settings.adminUsername,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSubs = submissions.map((s) => (s.id === id ? updatedSub : s));
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, updatedSub);

    // Record in Point History
    const student = students.find((s) => s.id === sub.studentId);
    const prevPoints = student ? student.totalPoints : 0;

    const historyRecord: PointHistoryRecord = {
      id: `ph-${Date.now()}`,
      studentId: sub.studentId,
      studentName: sub.studentName,
      activityId: sub.id,
      activityTitle: sub.title,
      category: sub.category,
      previousPoints: prevPoints,
      pointsAdded: pointsDelta,
      finalPoints: prevPoints + pointsDelta,
      adminName: settings.adminUsername,
      date: new Date().toISOString(),
      reason: reviewNote || `Approved submission and awarded ${awardedPoints} points.`,
    };

    setPointHistory((prev) => [historyRecord, ...prev]);
    await putInStore(STORES.POINT_HISTORY, historyRecord);

    // Student notification
    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      studentId: sub.studentId,
      title: 'Submission Approved & Points Awarded',
      message: `Your submission "${sub.title}" was approved with +${awardedPoints} points!`,
      type: 'success',
      relatedActivityId: sub.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [studentNotif, ...prev]);
    await putInStore(STORES.NOTIFICATIONS, studentNotif);

    await logAudit(
      'APPROVE_SUBMISSION',
      `Approved "${sub.title}" for ${sub.studentName} with +${awardedPoints} pts. Note: ${reviewNote || 'None'}`,
      'submission',
      id
    );

    await syncStudentPointsAndRanks(nextSubs, students);
    showToast(`Submission approved with ${awardedPoints} points!`, 'success');
    fireAchievementCelebration();
  };

  const rejectActivity = async (id: string, reason: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const updatedSub: ActivitySubmission = {
      ...sub,
      status: 'rejected',
      awardedPoints: 0,
      adminReviewNote: reason,
      reviewedBy: settings.adminUsername,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSubs = submissions.map((s) => (s.id === id ? updatedSub : s));
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, updatedSub);

    // Notify student
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      studentId: sub.studentId,
      title: 'Submission Not Approved',
      message: `Your submission "${sub.title}" was not approved. Reason: ${reason}`,
      type: 'error',
      relatedActivityId: sub.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    await putInStore(STORES.NOTIFICATIONS, notif);

    await logAudit('REJECT_SUBMISSION', `Rejected "${sub.title}" of ${sub.studentName}. Reason: ${reason}`, 'submission', id);
    await syncStudentPointsAndRanks(nextSubs, students);
    showToast('Submission marked as Rejected with feedback.', 'info');
  };

  const requestCorrectionActivity = async (id: string, reason: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const updatedSub: ActivitySubmission = {
      ...sub,
      status: 'correction_requested',
      adminReviewNote: reason,
      reviewedBy: settings.adminUsername,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSubs = submissions.map((s) => (s.id === id ? updatedSub : s));
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, updatedSub);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      studentId: sub.studentId,
      title: 'Correction Requested for Submission',
      message: `Admin requested changes on "${sub.title}": ${reason}`,
      type: 'warning',
      relatedActivityId: sub.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    await putInStore(STORES.NOTIFICATIONS, notif);

    await logAudit('REQUEST_CORRECTION', `Requested correction on "${sub.title}" of ${sub.studentName}. Note: ${reason}`, 'submission', id);
    showToast('Correction requested from student.', 'info');
  };

  const toggleFeatureActivity = async (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const newFeaturedState = !sub.isFeatured;
    const updatedSub: ActivitySubmission = {
      ...sub,
      isFeatured: newFeaturedState,
      updatedAt: new Date().toISOString(),
    };

    const nextSubs = submissions.map((s) => (s.id === id ? updatedSub : s));
    setSubmissions(nextSubs);
    await putInStore(STORES.SUBMISSIONS, updatedSub);

    await logAudit(
      newFeaturedState ? 'FEATURE_ACHIEVEMENT' : 'UNFEATURE_ACHIEVEMENT',
      `${newFeaturedState ? 'Featured' : 'Unfeatured'} achievement "${sub.title}" on public portal.`,
      'submission',
      id
    );
    showToast(newFeaturedState ? 'Achievement featured on public website!' : 'Achievement unfeatured.', 'success');
  };

  // Student CRUD
  const addStudent = async (
    studentData: Omit<Student, 'id' | 'totalPoints' | 'approvedCount' | 'pendingCount' | 'createdAt'>
  ): Promise<Student> => {
    // Check unique admission number
    const exists = students.some(
      (s) => s.admissionNumber.trim().toUpperCase() === studentData.admissionNumber.trim().toUpperCase()
    );
    if (exists) {
      throw new Error(`Admission Number "${studentData.admissionNumber}" already exists in the system.`);
    }

    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      totalPoints: 0,
      approvedCount: 0,
      pendingCount: 0,
      rank: students.length + 1,
      createdAt: new Date().toISOString(),
    };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    await putInStore(STORES.STUDENTS, newStudent);
    await logAudit('ADD_STUDENT', `Enrolled new student ${newStudent.name} (${newStudent.admissionNumber})`, 'student', newStudent.id);
    showToast(`Student ${newStudent.name} added successfully.`, 'success');
    fireScholarCelebration();
    return newStudent;
  };

  const updateStudent = async (student: Student) => {
    // Verify uniqueness excluding self
    const duplicate = students.some(
      (s) => s.id !== student.id && s.admissionNumber.trim().toUpperCase() === student.admissionNumber.trim().toUpperCase()
    );
    if (duplicate) {
      throw new Error(`Admission Number "${student.admissionNumber}" is already in use by another student.`);
    }

    const nextStudents = students.map((s) => (s.id === student.id ? student : s));
    setStudents(nextStudents);
    await putInStore(STORES.STUDENTS, student);

    if (currentStudent && currentStudent.id === student.id) {
      setCurrentStudent(student);
    }

    // Sync featured titles with updated avatar and student details
    const nextFeatured = featuredTitles.map((f) => {
      if (f.studentId === student.id) {
        return {
          ...f,
          studentName: student.name,
          studentAvatarUrl: student.avatarUrl,
          studentCourse: student.course,
          studentDepartment: student.department,
        };
      }
      return f;
    });
    setFeaturedTitles(nextFeatured);
    await putManyInStore(STORES.FEATURED_TITLES, nextFeatured);

    // Sync submissions with updated student details
    const nextSubs = submissions.map((s) => {
      if (s.studentId === student.id) {
        return {
          ...s,
          studentName: student.name,
          studentAdmissionNo: student.admissionNumber,
          studentCourse: student.course,
          studentDepartment: student.department,
        };
      }
      return s;
    });
    setSubmissions(nextSubs);
    await putManyInStore(STORES.SUBMISSIONS, nextSubs);

    await logAudit('UPDATE_STUDENT', `Updated profile and avatar of ${student.name} (${student.admissionNumber})`, 'student', student.id);
    showToast(`Student profile and photo updated successfully!`, 'success');
  };

  const deleteStudent = async (id: string) => {
    const target = students.find((s) => s.id === id);
    const nextStudents = students.filter((s) => s.id !== id);
    setStudents(nextStudents);
    await deleteFromStore(STORES.STUDENTS, id);

    // Also delete their submissions or keep archived
    const remainingSubs = submissions.filter((s) => s.studentId !== id);
    setSubmissions(remainingSubs);
    await putManyInStore(STORES.SUBMISSIONS, remainingSubs);

    if (target) {
      await logAudit('DELETE_STUDENT', `Removed student account ${target.name} (${target.admissionNumber})`, 'student', id);
    }
    showToast('Student deleted.', 'info');
  };

  const toggleStudentStatus = async (id: string) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    const updated = { ...student, isActive: !student.isActive };
    const nextStudents = students.map((s) => (s.id === id ? updated : s));
    setStudents(nextStudents);
    await putInStore(STORES.STUDENTS, updated);

    await logAudit(
      updated.isActive ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
      `${updated.isActive ? 'Activated' : 'Deactivated'} student account ${student.name}`,
      'student',
      id
    );
    showToast(`Student account ${updated.isActive ? 'activated' : 'deactivated'}.`, 'info');
  };

  // Point Rules CRUD
  const savePointRule = async (rule: PointRule) => {
    const nextRules = pointRules.some((r) => r.id === rule.id)
      ? pointRules.map((r) => (r.id === rule.id ? rule : r))
      : [rule, ...pointRules];
    setPointRules(nextRules);
    await putInStore(STORES.POINT_RULES, rule);
    await logAudit('SAVE_POINT_RULE', `Configured rule: ${rule.category} -> ${rule.activityType} (${rule.recommendedPoints} pts)`);
    showToast('Point rule saved.', 'success');
  };

  const deletePointRule = async (id: string) => {
    const nextRules = pointRules.filter((r) => r.id !== id);
    setPointRules(nextRules);
    await deleteFromStore(STORES.POINT_RULES, id);
    showToast('Point rule deleted.', 'info');
  };

  // Rank Rules CRUD
  const saveRankRule = async (rule: RankPointRule) => {
    const nextRules = rankRules.some((r) => r.id === rule.id)
      ? rankRules.map((r) => (r.id === rule.id ? rule : r))
      : [rule, ...rankRules];
    setRankRules(nextRules);
    await putInStore(STORES.RANK_RULES, rule);
    await logAudit('SAVE_RANK_RULE', `Configured rank rule: ${rule.rankName} (${rule.points} pts)`);
    showToast('Rank rule saved.', 'success');
  };

  const deleteRankRule = async (id: string) => {
    const nextRules = rankRules.filter((r) => r.id !== id);
    setRankRules(nextRules);
    await deleteFromStore(STORES.RANK_RULES, id);
    showToast('Rank rule removed.', 'info');
  };

  // Featured Student Titles & Honors CRUD
  const saveFeaturedTitle = async (title: FeaturedStudentTitle) => {
    const next = featuredTitles.some((t) => t.id === title.id)
      ? featuredTitles.map((t) => (t.id === title.id ? title : t))
      : [title, ...featuredTitles];
    setFeaturedTitles(next);
    await putInStore(STORES.FEATURED_TITLES, title);
    await logAudit('SAVE_FEATURED_TITLE', `Saved featured title "${title.title}" for ${title.studentName || 'Unassigned'}`);
    showToast('Featured Student Title saved successfully.', 'success');
  };

  const deleteFeaturedTitle = async (id: string) => {
    const next = featuredTitles.filter((t) => t.id !== id);
    setFeaturedTitles(next);
    await deleteFromStore(STORES.FEATURED_TITLES, id);
    await logAudit('DELETE_FEATURED_TITLE', `Removed title record ${id}`);
    showToast('Featured Student Title deleted.', 'info');
  };

  // Badges CRUD
  const saveBadge = async (badge: AchievementBadge) => {
    const next = badges.some((b) => b.id === badge.id)
      ? badges.map((b) => (b.id === badge.id ? badge : b))
      : [badge, ...badges];
    setBadges(next);
    await putInStore(STORES.BADGES, badge);
    showToast('Badge updated.', 'success');
    fireConfetti();
  };

  const deleteBadge = async (id: string) => {
    const next = badges.filter((b) => b.id !== id);
    setBadges(next);
    await deleteFromStore(STORES.BADGES, id);
    showToast('Badge removed.', 'info');
  };

  // Certificates
  const issueNewCertificate = async (
    certData: Omit<IssuedCertificate, 'id' | 'verificationHash'>
  ): Promise<IssuedCertificate> => {
    const certId = `SOMS-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationHash = `v-${certId.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;

    const newCert: IssuedCertificate = {
      ...certData,
      id: certId,
      verificationHash,
    };

    const nextCerts = [newCert, ...certificates];
    setCertificates(nextCerts);
    await putInStore(STORES.CERTIFICATES, newCert);

    // Notify student
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      studentId: newCert.studentId,
      title: 'Certificate of Achievement Issued',
      message: `An official verified certificate has been issued for "${newCert.activityTitle}".`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    await putInStore(STORES.NOTIFICATIONS, notif);

    await logAudit('ISSUE_CERTIFICATE', `Issued certificate ${certId} to ${newCert.studentName} for "${newCert.activityTitle}"`);
    showToast(`Certificate ${certId} issued with QR verification code!`, 'success');
    fireCertificateCelebration();
    return newCert;
  };

  // Settings
  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await putInStore(STORES.SETTINGS, { ...newSettings, id: 'main_settings' });
    await logAudit('UPDATE_SETTINGS', 'Updated organization information and portal display settings.');
    showToast('Settings saved successfully.', 'success');
  };

  // Notification read
  const markNotificationRead = async (id: string) => {
    const nextNotifs = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(nextNotifs);
    const item = nextNotifs.find((n) => n.id === id);
    if (item) await putInStore(STORES.NOTIFICATIONS, item);
  };


  const saveAnnouncement = async (announcement: Announcement) => {
    const nextAnnouncements = announcements.some((a) => a.id === announcement.id)
      ? announcements.map((a) => (a.id === announcement.id ? announcement : a))
      : [...announcements, announcement];
    setAnnouncements(nextAnnouncements.sort((a, b) => a.displayOrder - b.displayOrder));
    await putInStore(STORES.ANNOUNCEMENTS, announcement);
    showToast('Announcement saved.', 'success');
    fireConfetti();
  };

  const deleteAnnouncement = async (id: string) => {
    const nextAnnouncements = announcements.filter((a) => a.id !== id);
    setAnnouncements(nextAnnouncements);
    await deleteFromStore(STORES.ANNOUNCEMENTS, id);
    showToast('Announcement deleted.', 'info');
  };

  // Full Database Reset to Default
  const resetDatabaseToDefault = async () => {
    for (const store of Object.values(STORES)) {
      await clearEntireStore(store);
    }

    await putManyInStore(STORES.STUDENTS, INITIAL_STUDENTS);
    await putManyInStore(STORES.SUBMISSIONS, INITIAL_SUBMISSIONS);
    await putManyInStore(STORES.POINT_RULES, INITIAL_POINT_RULES);
    await putManyInStore(STORES.RANK_RULES, INITIAL_RANK_RULES);
    await putManyInStore(STORES.POINT_HISTORY, INITIAL_POINT_HISTORY);
    await putManyInStore(STORES.FEATURED_TITLES, INITIAL_FEATURED_TITLES);
    await putManyInStore(STORES.BADGES, INITIAL_BADGES);
    await putManyInStore(STORES.CERTIFICATES, INITIAL_CERTIFICATES);
    await putManyInStore(STORES.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    await putManyInStore(STORES.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    await putManyInStore(STORES.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    await putInStore(STORES.SETTINGS, { ...INITIAL_SETTINGS, id: 'main_settings' });

    setStudents(INITIAL_STUDENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setPointRules(INITIAL_POINT_RULES);
    setRankRules(INITIAL_RANK_RULES);
    setPointHistory(INITIAL_POINT_HISTORY);
    setFeaturedTitles(INITIAL_FEATURED_TITLES);
    setBadges(INITIAL_BADGES);
    setCertificates(INITIAL_CERTIFICATES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSettings(INITIAL_SETTINGS);

    showToast('Database reset to institutional demonstration state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentStudent,
        activeView,
        activeAdminTab,
        activeStudentTab,
        setActiveView,
        setActiveAdminTab,
        setActiveStudentTab,
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
        announcements,
        loading,
        showAdminLoginModal,
        setShowAdminLoginModal,
        showStudentLoginModal,
        setShowStudentLoginModal,
        verificationCertId,
        setVerificationCertId,
        triggerLogoClick,
        logoClickCount,
        toast,
        showToast,
        loginAsStudent,
        loginAsAdmin,
        logout,
        submitActivity,
        updateActivity,
        deleteActivity,
        approveActivity,
        rejectActivity,
        requestCorrectionActivity,
        toggleFeatureActivity,
        addStudent,
        updateStudent,
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
        updateSettings,
        saveAnnouncement,
        deleteAnnouncement,
        resetDatabaseToDefault,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
