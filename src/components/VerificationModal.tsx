/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateQRCodeDataURL } from '../lib/qrCode';
import { exportCertificatePDF } from '../lib/pdfExport';
import { ShieldCheck, CheckCircle2, Download, X, Award, ExternalLink, Calendar, User, FileText } from 'lucide-react';

export const VerificationModal: React.FC = () => {
  const { verificationCertId, setVerificationCertId, certificates, settings } = useApp();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const cert = certificates.find((c) => c.id === verificationCertId);

  useEffect(() => {
    if (cert) {
      generateQRCodeDataURL(cert.verificationUrl || `https://soms.edu/verify/${cert.id}`).then((url) => {
        setQrCodeUrl(url);
      });
    }
  }, [cert]);

  if (!verificationCertId || !cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="verification-modal"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={() => setVerificationCertId(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase border border-emerald-400/30">
            Institutional Authenticity Verified
          </span>

          <h3 className="text-xl font-bold mt-2 tracking-tight">Official Certificate Verification</h3>
          <p className="text-xs text-slate-400 mt-0.5">{settings.organizationName}</p>
        </div>

        {/* Certificate Verification Body */}
        <div className="p-6 space-y-5 text-center">
          
          {/* Dynamic Cryptographic QR Seal */}
          <div className="inline-block p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 shadow-2xs">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Verification QR Code"
                className="w-40 h-40 object-contain mx-auto"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                Generating Seal...
              </div>
            )}
            <p className="text-[10px] font-mono text-slate-500 mt-1 font-semibold uppercase tracking-wider">
              {cert.id}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Student Honoree</span>
              <span className="font-bold text-slate-900">{cert.studentName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Admission Number</span>
              <span className="font-mono font-bold text-slate-800">{cert.studentAdmissionNo}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Activity Title</span>
              <span className="font-bold text-slate-900 max-w-[200px] truncate text-right">{cert.activityTitle}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Points Awarded</span>
              <span className="font-black text-emerald-700">+{cert.pointsAwarded} Points</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Issue Date</span>
              <span className="font-semibold text-slate-800">{cert.issueDate}</span>
            </div>
          </div>

          {/* Download Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => exportCertificatePDF(cert, settings.organizationName, settings.logoUrl)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Formal PDF Certificate
            </button>
            <button
              onClick={() => setVerificationCertId(null)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
