/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Student, ActivitySubmission, PointHistoryRecord, IssuedCertificate } from '../types';
import { generateVerificationQR } from './qrCode';

export async function exportStudentReportPDF(
  student: Student,
  submissions: ActivitySubmission[],
  pointHistory: PointHistoryRecord[],
  orgName: string,
  logoUrl?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const approvedSubs = submissions.filter((s) => s.status === 'approved');

  // Header Background Ribbon
  doc.setFillColor(30, 58, 138); // Deep Academic Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Institution Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(orgName.toUpperCase(), 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text('OFFICIAL STUDENT ACHIEVEMENT & OUTREACH DOSSIER', 14, 18);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - 14, 18, { align: 'right' });

  // Student Profile Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 34, pageWidth - 28, 38, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(student.name, 20, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Admission No: ${student.admissionNumber}`, 20, 51);
  doc.text(`Course: ${student.course}`, 20, 57);
  doc.text(`Department: ${student.department} | Batch: ${student.batch}`, 20, 63);

  // Key Metrics Badges in the box
  // Points Badge
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(pageWidth - 75, 40, 26, 26, 2, 2, 'FD');
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${student.totalPoints}`, pageWidth - 62, 52, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL POINTS', pageWidth - 62, 59, { align: 'center' });

  // Rank Badge
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(pageWidth - 44, 40, 26, 26, 2, 2, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`#${student.rank || 1}`, pageWidth - 31, 52, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('CAMPUS RANK', pageWidth - 31, 59, { align: 'center' });

  let curY = 80;

  // Section: Approved Activities & Achievements
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`VERIFIED ACHIEVEMENTS & OUTREACH (${approvedSubs.length})`, 14, curY);

  curY += 5;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, curY, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', 16, curY + 5.5);
  doc.text('CATEGORY', 38, curY + 5.5);
  doc.text('TITLE / RECORD', 75, curY + 5.5);
  doc.text('ROLE / RANK', 150, curY + 5.5);
  doc.text('POINTS', pageWidth - 16, curY + 5.5, { align: 'right' });

  curY += 9;
  doc.setFont('helvetica', 'normal');

  approvedSubs.forEach((item, idx) => {
    if (curY > pageHeight - 35) {
      doc.addPage();
      curY = 20;
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, curY - 3, pageWidth - 28, 7.5, 'F');
    }

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.text(item.date, 16, curY + 2);
    
    // Category formatted
    const catLabel = item.category.replace('_', ' ').toUpperCase();
    doc.text(catLabel.substring(0, 18), 38, curY + 2);

    // Title truncated safely
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const titleSnippet = item.title.length > 45 ? item.title.substring(0, 42) + '...' : item.title;
    doc.text(titleSnippet, 75, curY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const subTypeRank = item.participationRank || item.subType || '-';
    doc.text(subTypeRank.substring(0, 22), 150, curY + 2);

    // Points
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`+${item.awardedPoints}`, pageWidth - 16, curY + 2, { align: 'right' });

    curY += 7.5;
  });

  // Section: Verification QR Code & Seal
  curY = Math.max(curY + 8, pageHeight - 45);
  if (curY > pageHeight - 40) {
    doc.addPage();
    curY = 20;
  }

  // Generate QR
  try {
    const qrData = await generateVerificationQR(student.admissionNumber);
    if (qrData) {
      doc.addImage(qrData, 'PNG', 14, curY, 24, 24);
    }
  } catch (e) {
    console.error(e);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('INSTITUTIONAL VERIFICATION SEAL', 42, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan the QR code to verify this academic record against our institutional outreach database.', 42, curY + 11);
  doc.text(`Verified under reference: SOMS-REC-${student.admissionNumber}`, 42, curY + 16);
  doc.text('Imperial College Academic Affairs & Student Outreach Council', 42, curY + 21);

  // Save the PDF
  doc.save(`${student.admissionNumber}_achievement_report.pdf`);
}

export async function exportCertificatePDF(
  cert: IssuedCertificate,
  orgName: string,
  logoUrl?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Outer Border (Navy & Gold Elegance)
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(30, 58, 138); // Navy Inner Line
  doc.setLineWidth(0.7);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Background subtle tint
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28, 'F');

  // Institution Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(orgName.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT OUTREACH & ACADEMIC RECOGNITION BOARD', pageWidth / 2, 34, { align: 'center' });

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(180, 83, 9); // Deep Gold Amber
  doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 48, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text('This institutional honor is proudly presented to', pageWidth / 2, 57, { align: 'center' });

  // Student Name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cert.studentName, pageWidth / 2, 69, { align: 'center' });

  // Student ID line
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`(Admission No: ${cert.studentAdmissionNo})`, pageWidth / 2, 75, { align: 'center' });

  // Achievement Description
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('for exceptional meritorious performance and dedication in:', pageWidth / 2, 85, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  const splitTitle = doc.splitTextToSize(cert.activityTitle, 200);
  doc.text(splitTitle, pageWidth / 2, 94, { align: 'center' });

  // Details
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const splitDetails = doc.splitTextToSize(cert.achievementDetails, 200);
  doc.text(splitDetails, pageWidth / 2, 106, { align: 'center' });

  // Points Awarded Tag
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(pageWidth / 2 - 35, 116, 70, 9, 2, 2, 'FD');
  doc.setTextColor(67, 56, 202);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Official Academic Points Awarded: +${cert.pointsAwarded}`, pageWidth / 2, 122, { align: 'center' });

  // Bottom Elements: Date, Signatures, QR code
  const bottomY = 145;

  // QR Verification Code
  try {
    const qrData = await generateVerificationQR(cert.id);
    if (qrData) {
      doc.addImage(qrData, 'PNG', 24, bottomY, 26, 26);
    }
  } catch (e) {
    console.error(e);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate ID: ${cert.id}`, 24, bottomY + 30);
  doc.text(`Issued Date: ${cert.issueDate}`, 24, bottomY + 34);

  // Signatures
  // Left signature
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 120, bottomY + 20, pageWidth - 70, bottomY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Dr. Katherine Vance', pageWidth - 95, bottomY + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Convener, Outreach Committee', pageWidth - 95, bottomY + 29, { align: 'center' });

  // Right signature
  doc.line(pageWidth - 60, bottomY + 20, pageWidth - 20, bottomY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Prof. Arthur Pendelton', pageWidth - 40, bottomY + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Principal & Dean of College', pageWidth - 40, bottomY + 29, { align: 'center' });

  doc.save(`${cert.id}_${cert.studentAdmissionNo}.pdf`);
}

export async function exportLeaderboardPDF(students: Student[], orgName: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(orgName.toUpperCase(), 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL CAMPUS MERIT LEADERBOARD & OUTREACH STANDINGS', 14, 18);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 18, { align: 'right' });

  let curY = 36;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, curY, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('RANK', 16, curY + 5.5);
  doc.text('STUDENT NAME', 32, curY + 5.5);
  doc.text('ADMISSION NO', 82, curY + 5.5);
  doc.text('COURSE / DEPARTMENT', 120, curY + 5.5);
  doc.text('POINTS', pageWidth - 16, curY + 5.5, { align: 'right' });

  curY += 9;
  doc.setFont('helvetica', 'normal');

  students.forEach((std, idx) => {
    if (curY > 275) {
      doc.addPage();
      curY = 20;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, curY - 3, pageWidth - 28, 7.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(std.rank && std.rank <= 3 ? 180 : 71, std.rank && std.rank <= 3 ? 83 : 85, std.rank && std.rank <= 3 ? 9 : 105);
    doc.text(`#${std.rank || idx + 1}`, 16, curY + 2);

    doc.setTextColor(15, 23, 42);
    doc.text(std.name, 32, curY + 2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(std.admissionNumber, 82, curY + 2);
    doc.text(`${std.course.substring(0, 28)} (${std.department.substring(0, 16)})`, 120, curY + 2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`${std.totalPoints} pts`, pageWidth - 16, curY + 2, { align: 'right' });

    curY += 7.5;
  });

  doc.save('Campus_Outreach_Leaderboard.pdf');
}
