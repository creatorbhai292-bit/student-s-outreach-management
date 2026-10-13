/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'guest' | 'student' | 'admin';

export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'correction_requested';

export type ActivityCategory = 
  | 'publication'
  | 'paper_presentation'
  | 'seminar'
  | 'college_program'
  | 'outside_program'
  | 'competition'
  | 'award'
  | 'other_activity';

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  course: string;
  department: string;
  batch: string;
  avatarUrl: string;
  isActive: boolean;
  totalPoints: number;
  approvedCount: number;
  pendingCount: number;
  rank?: number;
  bio?: string;
  isPublicProfileEnabled?: boolean;
  publicBio?: string;
  createdAt: string;
}

export interface ActivitySubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentAdmissionNo: string;
  studentCourse: string;
  studentDepartment: string;
  category: ActivityCategory;
  title: string;
  status: SubmissionStatus;
  date: string;
  description: string;
  
  // Specific Category Attributes
  subType?: string; // e.g. "Article", "Ghazal", "Naat", "Research Paper", "Keynote", "Workshop"
  venueOrOrganizer?: string; // Organization, Newspaper, College Name, Location
  externalLink?: string; // Link to publication, event page, paper DOI
  participationRank?: string; // '1st' | '2nd' | '3rd' | 'Winner' | 'Runner Up' | 'Participation' | etc.
  participationType?: string; // 'Solo' | 'Team Leader' | 'Member' | 'Presenter' | 'Attendee'
  
  // Attachments
  imageUrl?: string; // Stored as base64 or blob URL
  certificateUrl?: string;
  supportingDocUrl?: string;
  supportingDocName?: string;
  
  // Points & Review
  recommendedPoints: number;
  awardedPoints: number;
  adminReviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Featured Flags
  isFeatured: boolean;
  featuredOrder?: number;
  featuredTitle?: string;
  featuredDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PointRule {
  id: string;
  category: ActivityCategory;
  activityType: string; // e.g., "Article", "Research Article", "Debate", etc.
  recommendedPoints: number;
  maxPoints: number;
  isActive: boolean;
  adminNote?: string;
}

export interface RankPointRule {
  id: string;
  rankName: string; // '1st', '2nd', '3rd', 'Winner', 'Runner Up', 'Finalist', 'Participation'
  points: number;
  isActive: boolean;
  description?: string;
}

export interface PointHistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  activityId?: string;
  activityTitle: string;
  category: ActivityCategory;
  previousPoints: number;
  pointsAdded: number; // can be negative if revoked
  finalPoints: number;
  adminName: string;
  date: string;
  reason: string;
}

export interface FeaturedStudentTitle {
  id: string;
  title: string; // e.g., "Best Writer", "Best Orator", "Student of the Year"
  studentId?: string;
  studentName?: string;
  studentAdmissionNo?: string;
  studentDepartment?: string;
  studentCourse?: string;
  studentAvatarUrl?: string;
  shortDescription: string;
  sessionYear: string; // e.g., "2025-2026"
  positionSubtitle?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  showOnHomePage: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementBadge {
  id: string;
  name: string; // e.g., "Publication Star", "Top Performer"
  icon: string; // Lucide icon name
  description: string;
  minPointsOrCriteria: string;
  assignedStudentIds: string[];
  isActive: boolean;
  color: string;
}

export interface IssuedCertificate {
  id: string; // Certificate unique code, e.g. SOMS-CERT-2026-9812
  studentId: string;
  studentName: string;
  studentAdmissionNo: string;
  activityId: string;
  activityTitle: string;
  category: ActivityCategory;
  achievementDetails: string;
  issueDate: string;
  organizationName: string;
  pointsAwarded: number;
  verificationHash: string;
  qrDataUrl?: string;
}

export interface AppNotification {
  id: string;
  recipientRole: 'admin' | 'student';
  studentId?: string; // if targeted to specific student
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedActivityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminName: string;
  details: string;
  timestamp: string;
  recordType?: string;
  recordId?: string;
  previousValue?: string;
  newValue?: string;
}

export interface AppSettings {
  organizationName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  theme: 'light' | 'academic_blue' | 'classic_emerald';
  publicLeaderboard: boolean;
  publicAchievements: boolean;
  publicPublications: boolean;
  featuredStudentsSection: boolean;
  studentNamesPublic: boolean;
  adminUsername: string;
  adminPasswordHash: string; // "admin123" by default
  adminAvatarUrl?: string;

  // Front Page & Hero Section Customization
  heroBadgeText?: string;
  heroHeadingPrefix?: string;
  heroHeadingHighlight?: string;
  heroDescription?: string;
  heroPrimaryBtnText?: string;
  heroSecondaryBtnText?: string;
  heroShowBadge?: boolean;
  heroShowStats?: boolean;
  showAnnouncementBar?: boolean;
  announcementBarText?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
