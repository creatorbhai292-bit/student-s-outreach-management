/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Award,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  FileCheck,
  Zap,
  Clock,
  Compass,
  Building2,
  Users2,
  Scale,
  BadgeCheck,
  HelpCircle,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { settings, pointRules } = useApp();
  const [activeTab, setActiveTab] = useState<'mission' | 'rubric' | 'governance' | 'contact'>('mission');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Institutional Accreditation & Quality Assurance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          About Darul Huda Islamic University
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Students Outreach Dashboard
        </p>
      </motion.div>

      {/* Interactive Navigation Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { id: 'mission', label: 'Institutional Mission', icon: Compass },
          { id: 'rubric', label: 'Merit Scoring Rubric', icon: Award },
          { id: 'governance', label: 'Verification Protocol', icon: Scale },
          { id: 'contact', label: 'Outreach Council & Contact', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* TAB 1: INSTITUTIONAL MISSION & STATS */}
      {activeTab === 'mission' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 transition-all hover:shadow-lg hover:border-blue-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Academic Recognition</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized evaluation benchmark for student publications in Scopus, Web of Science, UGC-CARE list journals, and national symposium proceedings.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <span>Direct Transcript Integration</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 transition-all hover:shadow-lg hover:border-emerald-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Digital QR Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every verified achievement generates a cryptographic tamper-evident PDF dossier with instant QR verification for global university and corporate admission.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span>Tamper-Proof Credentials</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 transition-all hover:shadow-lg hover:border-amber-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">NAAC & NIRF Auditing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-categorized institutional data exporting into NIRF, NAAC Criterion 3 & 5 compliance spreadsheets with zero administrative latency.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <span>Criterion Audit Ready</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>

          {/* Institutional Charter Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Official Charter
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Institutional Outreach & Merit Mandate
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                The Students Outreach Dashboard serves as the primary system of record for collegiate accomplishments. By democratizing merit tracking, every scholar's innovation is immortalized in the institutional memory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-bold block text-sm">100% Verified</span>
                <span className="text-slate-300 mt-1 block">Every record backed by faculty review & verifiable proof</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-blue-400 font-bold block text-sm">Real-time Ranking</span>
                <span className="text-slate-300 mt-1 block">Live recalculation upon dean & faculty approval</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-emerald-400 font-bold block text-sm">Cryptographic QR</span>
                <span className="text-slate-300 mt-1 block">One-click online verification for recruiters</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-purple-400 font-bold block text-sm">Student Centered</span>
                <span className="text-slate-300 mt-1 block">Direct two-way correction messaging with review board</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: MERIT SCORING RUBRIC */}
      {activeTab === 'rubric' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Merit Scoring Matrix</h2>
              <p className="text-xs text-slate-500">Official academic point distribution approved by the Academic Council.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Session 2025 - 2026 Rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'International / Scopus Indexed Journals',
                range: '30 - 45 Points',
                desc: 'Original research papers published in journals indexed in Scopus, Web of Science, or IEEE Xplore with verified DOI.',
                color: 'blue',
              },
              {
                title: 'UGC-CARE / National Peer-Reviewed Journals',
                range: '20 - 30 Points',
                desc: 'Research articles published in recognized national academic journals with peer-review certificates.',
                color: 'indigo',
              },
              {
                title: 'International Conference Paper Presentation',
                range: '25 - 35 Points',
                desc: 'Oral or poster presentation delivered at an IEEE, ACM, or Springer endorsed international symposium.',
                color: 'purple',
              },
              {
                title: 'National Conference Paper Presentation',
                range: '15 - 25 Points',
                desc: 'Paper presentation delivered at recognized state/national collegiate academic congresses.',
                color: 'emerald',
              },
              {
                title: 'National Hackathons & Competitions (1st - 3rd Place)',
                range: '25 - 40 Points',
                desc: 'Top podium finish at Smart India Hackathon, ACM ICPC, or national university competitions.',
                color: 'amber',
              },
              {
                title: 'Newspaper Columns, Articles & Creative Works',
                range: '10 - 20 Points',
                desc: 'Published editorial in mainstream daily newspapers, university magazines, or recognized literary anthologies.',
                color: 'rose',
              },
            ].map((rubric, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-400 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Standard Benchmark
                    </span>
                    <span className="font-black text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {rubric.range}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{rubric.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rubric.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Requires document proof or DOI link</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 3: VERIFICATION PROTOCOL & GOVERNANCE */}
      {activeTab === 'governance' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Two-Tier Verification Lifecycle</h2>
            <p className="text-xs text-slate-500">
              How student claims transition from draft submission into official accredited institutional merit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Student Upload',
                desc: 'Student enters activity metadata, uploads proof PDF or image, and provides external verification links.',
                icon: BookOpen,
              },
              {
                step: '02',
                title: 'Department Scrutiny',
                desc: 'Faculty coordinators verify certificate authenticity, conference dates, and student co-authors.',
                icon: FileCheck,
              },
              {
                step: '03',
                title: 'Point Allocation & Feedback',
                desc: 'Reviewers assign standardized points or message the student with explicit instructions if corrections are needed.',
                icon: Award,
              },
              {
                step: '04',
                title: 'Permanent Ledger & PDF',
                desc: 'Merit points are committed to the campus leaderboard and stamped onto verifiable QR student transcripts.',
                icon: BadgeCheck,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden"
                >
                  <span className="text-3xl font-black text-slate-200 block">{step.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* TAB 4: OUTREACH COUNCIL & CONTACT */}
      {activeTab === 'contact' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 space-y-8 relative overflow-hidden">
            {/* Ambient background glow accents */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Direct Administrative Contact
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Academic Outreach Council
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Have questions regarding activity classification, retroactive point endorsements, or accreditation audits? Reach out to the central secretariat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 border-t border-white/10 pt-6">
              {/* CARD 1: INSTITUTIONAL CAMPUS */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-blue-400/40 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="relative p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-300 border border-blue-400/20 uppercase tracking-wider">
                      Headquarters
                    </span>
                  </div>

                  <span className="font-bold text-white block text-sm tracking-tight">
                    Institutional Campus
                  </span>
                  <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                    {settings.address || 'Darul Huda Islamic University, Chemmad'}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.address || 'Darul Huda Islamic University, Chemmad', 'campus')}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'campus' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Darul Huda Islamic University Chemmad')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-[11px] font-semibold text-blue-200 hover:text-white border border-blue-400/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Map</span>
                    <ExternalLink className="w-3 h-3 text-blue-300" />
                  </a>
                </div>
              </motion.div>

              {/* CARD 2: OUTREACH SECRETARIAT */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-emerald-400/40 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Direct Line</span>
                    </div>
                  </div>

                  <span className="font-bold text-white block text-sm tracking-tight">
                    Outreach Secretariat
                  </span>
                  <p className="text-base font-bold text-emerald-300 mt-1.5 tracking-wide font-mono">
                    {settings.phone || '8521367782'}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2">
                  <a
                    href={`tel:${(settings.phone || '8521367782').replace(/[^0-9+]/g, '')}`}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-[11px] font-semibold text-emerald-200 hover:text-white border border-emerald-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Call Now</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.phone || '8521367782', 'phone')}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* CARD 3: VERIFICATION DESK */}
              <motion.div
                whileHover={{ y: -4, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="group relative rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-indigo-400/40 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-400/10 text-indigo-300 border border-indigo-400/20 uppercase tracking-wider">
                      Official Desk
                    </span>
                  </div>

                  <span className="font-bold text-white block text-sm tracking-tight">
                    Verification Desk
                  </span>
                  <p className="text-xs text-indigo-200 mt-1.5 font-mono font-medium break-all">
                    {settings.email || 'outreach@dhiu.in'}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2">
                  <a
                    href={`mailto:${settings.email || 'outreach@dhiu.in'}`}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-[11px] font-semibold text-indigo-200 hover:text-white border border-indigo-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Send Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.email || 'outreach@dhiu.in', 'email')}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

