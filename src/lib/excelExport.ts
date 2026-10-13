/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Student, ActivitySubmission, PointHistoryRecord, PointRule, IssuedCertificate } from '../types';

export function exportStudentDataExcel(
  student: Student,
  submissions: ActivitySubmission[],
  pointHistory: PointHistoryRecord[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Profile sheet
  const profileData = [
    ['Metric', 'Value'],
    ['Student Name', student.name],
    ['Admission Number', student.admissionNumber],
    ['Email', student.email],
    ['Course', student.course],
    ['Department', student.department],
    ['Batch', student.batch],
    ['Total Points', student.totalPoints],
    ['Current Rank', student.rank || 'N/A'],
    ['Approved Submissions', student.approvedCount],
    ['Pending Submissions', student.pendingCount],
    ['Account Status', student.isActive ? 'Active' : 'Inactive'],
  ];
  const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, wsProfile, 'My Profile');

  // 2. Submissions sheet
  const subRows = submissions.map((s, idx) => ({
    '#': idx + 1,
    'Category': s.category.toUpperCase().replace('_', ' '),
    'Sub-Type': s.subType || '-',
    'Title': s.title,
    'Status': s.status.toUpperCase(),
    'Date': s.date,
    'Venue / Organizer': s.venueOrOrganizer || '-',
    'Rank / Position': s.participationRank || '-',
    'Recommended Points': s.recommendedPoints,
    'Awarded Points': s.awardedPoints,
    'Admin Review Note': s.adminReviewNote || '-',
    'Reviewed By': s.reviewedBy || '-',
    'Reviewed Date': s.reviewedAt || '-',
  }));
  const wsSubs = XLSX.utils.json_to_sheet(subRows);
  XLSX.utils.book_append_sheet(wb, wsSubs, 'My Activities');

  // 3. Point History sheet
  const historyRows = pointHistory.map((ph, idx) => ({
    '#': idx + 1,
    'Date': ph.date,
    'Activity Title': ph.activityTitle,
    'Category': ph.category.toUpperCase().replace('_', ' '),
    'Previous Points': ph.previousPoints,
    'Points Added': ph.pointsAdded,
    'Final Points': ph.finalPoints,
    'Authorized By': ph.adminName,
    'Reason / Audit Note': ph.reason,
  }));
  const wsHistory = XLSX.utils.json_to_sheet(historyRows);
  XLSX.utils.book_append_sheet(wb, wsHistory, 'Points Audit');

  XLSX.writeFile(wb, `${student.admissionNumber}_my_data.xlsx`);
}

export function exportAdminFullDataExcel(
  students: Student[],
  submissions: ActivitySubmission[],
  pointRules: PointRule[],
  certificates: IssuedCertificate[],
  pointHistory: PointHistoryRecord[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Students
  const stdRows = students.map((s) => ({
    'Admission Number': s.admissionNumber,
    'Name': s.name,
    'Course': s.course,
    'Department': s.department,
    'Batch': s.batch,
    'Email': s.email,
    'Total Points': s.totalPoints,
    'Campus Rank': s.rank || '-',
    'Approved Activities': s.approvedCount,
    'Pending Activities': s.pendingCount,
    'Status': s.isActive ? 'Active' : 'Deactivated',
  }));
  const wsStudents = XLSX.utils.json_to_sheet(stdRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Students');

  // 2. Submissions
  const subRows = submissions.map((s) => ({
    'Submission ID': s.id,
    'Student Name': s.studentName,
    'Admission No': s.studentAdmissionNo,
    'Department': s.studentDepartment,
    'Category': s.category,
    'Sub-Type': s.subType || '-',
    'Title': s.title,
    'Status': s.status,
    'Activity Date': s.date,
    'Awarded Points': s.awardedPoints,
    'Organizer / Venue': s.venueOrOrganizer || '-',
    'Rank / Role': s.participationRank || '-',
    'Featured Status': s.isFeatured ? 'Yes' : 'No',
    'Review Note': s.adminReviewNote || '',
    'Reviewed By': s.reviewedBy || '',
  }));
  const wsSubs = XLSX.utils.json_to_sheet(subRows);
  XLSX.utils.book_append_sheet(wb, wsSubs, 'Activities & Submissions');

  // 3. Point History
  const historyRows = pointHistory.map((ph) => ({
    'Record ID': ph.id,
    'Student Name': ph.studentName,
    'Date': ph.date,
    'Activity': ph.activityTitle,
    'Category': ph.category,
    'Previous Points': ph.previousPoints,
    'Points Added': ph.pointsAdded,
    'Final Points': ph.finalPoints,
    'Admin Author': ph.adminName,
    'Reason': ph.reason,
  }));
  const wsHistory = XLSX.utils.json_to_sheet(historyRows);
  XLSX.utils.book_append_sheet(wb, wsHistory, 'Point History');

  // 4. Point Rules
  const ruleRows = pointRules.map((r) => ({
    'Rule ID': r.id,
    'Category': r.category,
    'Activity Type': r.activityType,
    'Recommended Points': r.recommendedPoints,
    'Max Points': r.maxPoints,
    'Active': r.isActive ? 'Yes' : 'No',
    'Note': r.adminNote || '',
  }));
  const wsRules = XLSX.utils.json_to_sheet(ruleRows);
  XLSX.utils.book_append_sheet(wb, wsRules, 'Point Rules');

  // 5. Issued Certificates
  const certRows = certificates.map((c) => ({
    'Certificate ID': c.id,
    'Student Name': c.studentName,
    'Admission No': c.studentAdmissionNo,
    'Achievement': c.activityTitle,
    'Category': c.category,
    'Issue Date': c.issueDate,
    'Points Awarded': c.pointsAwarded,
    'Verification Hash': c.verificationHash,
  }));
  const wsCerts = XLSX.utils.json_to_sheet(certRows);
  XLSX.utils.book_append_sheet(wb, wsCerts, 'Certificates');

  XLSX.writeFile(wb, `SOMS_Institutional_Data_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportModuleExcel(moduleTitle: string, submissions: ActivitySubmission[]) {
  const wb = XLSX.utils.book_new();
  const rows = submissions.map((s, idx) => ({
    '#': idx + 1,
    'Student Name': s.studentName,
    'Admission No': s.studentAdmissionNo,
    'Department': s.studentDepartment,
    'Title': s.title,
    'Type / Subtype': s.subType || '-',
    'Status': s.status.toUpperCase(),
    'Date': s.date,
    'Organizer / Venue': s.venueOrOrganizer || '-',
    'Rank': s.participationRank || '-',
    'Points Awarded': s.awardedPoints,
    'Reviewed By': s.reviewedBy || '-',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, moduleTitle.substring(0, 31));
  XLSX.writeFile(wb, `${moduleTitle.replace(/\s+/g, '_')}_Report.xlsx`);
}

export function exportPointHistoryLedgerExcel(categoryName: string, records: PointHistoryRecord[]) {
  const wb = XLSX.utils.book_new();
  const rows = records.map((r, idx) => ({
    '#': idx + 1,
    'Timestamp': new Date(r.date).toLocaleString(),
    'Student Name': r.studentName,
    'Student ID': r.studentId,
    'Activity Record': r.activityTitle,
    'Category': (r.category || '').toUpperCase().replace(/_/g, ' '),
    'Previous Balance': r.previousPoints ?? 0,
    'Points Delta': (r.pointsAdded > 0 ? `+${r.pointsAdded}` : `${r.pointsAdded}`),
    'Final Balance': r.finalPoints,
    'Authorized By': r.adminName,
    'Audit Reason / Committee Note': r.reason || 'Verified and approved.',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const sheetTitle = (categoryName || 'Point_History').substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  XLSX.writeFile(
    wb,
    `Point_Audit_Ledger_${categoryName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  );
}
