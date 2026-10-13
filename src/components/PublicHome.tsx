/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PublicStudentProfileModal } from './PublicStudentProfileModal';
import { Student } from '../types';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ActivitySubmission, ActivityCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {


  Trophy,
  Award,
  BookOpen,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  ArrowRight,
  Star,
  Flame,
  ShieldCheck,
  Eye,
  X,
  Play,
  Pause,
  Zap,
  Layers,
  Presentation,
  FileText,
  Compass,
  MapPin,
} from 'lucide-react';

// Dynamic animated number counter component
const CountUpNumber: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1200 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo function
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(easeOut * value));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const PublicHome: React.FC = () => {
  const {
    students,
    submissions,
    featuredTitles,
    settings,
    setShowStudentLoginModal,
    certificates,
    badges,
    setActiveView,
  } = useApp();

  // Dynamic Statistics
  const totalStudentsCount = students.length;
  const approvedSubmissions = submissions.filter((s) => s.status === 'approved');
  const totalApprovedCount = approvedSubmissions.length;
  const totalPublicationsCount = approvedSubmissions.filter((s) => s.category === 'publication').length;
  const totalPointsCount = students.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0);
  const totalProgramsCount = approvedSubmissions.filter(
    (s) => s.category === 'college_program' || s.category === 'outside_program'
  ).length;
  const totalCompetitionsCount = approvedSubmissions.filter((s) => s.category === 'competition').length;

  // Featured Students Carousel state
  const activeFeaturedTitles = featuredTitles
    .filter((f) => f.isFeatured && f.isActive && f.showOnHomePage)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  // Rotation speed: default 2.5s (supports 2s, 2.5s, 3s per user request)
  const [rotationDuration, setRotationDuration] = useState<number>(2500);

  // Auto-play timer: 2 to 3 SECONDS per user request
  // ("fir OUR FEATURED STUDENTS me 5 SECONDS ke jagah 2 ya3 SECONDS ka hona hai")
  useEffect(() => {
    if (activeFeaturedTitles.length <= 1 || isPaused) return;

    const intervalTime = rotationDuration;
    const tickTime = 30;
    let elapsed = 0;
    setProgress(0);

    const progressInterval = setInterval(() => {
      elapsed += tickTime;
      const currentPct = Math.min((elapsed / intervalTime) * 100, 100);
      setProgress(currentPct);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setProgress(0);
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % activeFeaturedTitles.length);
      }
    }, tickTime);

    return () => clearInterval(progressInterval);
  }, [activeFeaturedTitles.length, isPaused, currentIndex, rotationDuration]);

  const handleNext = () => {
    setDirection(1);
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % activeFeaturedTitles.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setProgress(0);
    setCurrentIndex((prev) =>
      prev === 0 ? activeFeaturedTitles.length - 1 : prev - 1
    );
  };

  const handleDotClick = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setProgress(0);
    setCurrentIndex(idx);
  };

  // Modal for Viewing Full Achievement Details
  const [selectedSubmission, setSelectedSubmission] = useState<ActivitySubmission | null>(null);

  // Featured Publications & Achievements
  const featuredPublications = approvedSubmissions.filter(
    (s) => s.category === 'publication' && s.isFeatured
  );
  const featuredAchievements = approvedSubmissions.filter(
    (s) => s.category !== 'publication' && s.isFeatured
  );

  // Category Tab for Mini Gallery
  const [galleryCategory, setGalleryCategory] = useState<string>('all');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const filteredGallerySubs = approvedSubmissions.filter((s) => {
    if (galleryCategory === 'all') return true;
    return s.category === galleryCategory;
  });

  // Dynamic Category definitions with Lucide Icons and active states
  const galleryCategories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Activities', icon: Layers },
    { id: 'publication', label: 'Publications', icon: BookOpen },
    { id: 'paper_presentation', label: 'Presentations', icon: FileText },
    { id: 'seminar', label: 'Seminars', icon: Users },
    { id: 'college_program', label: 'College Programs', icon: Building },
    { id: 'outside_program', label: 'Outside Programs', icon: Compass },
    { id: 'competition', label: 'Competitions', icon: Trophy },
    { id: 'award', label: 'Awards', icon: Award },
  ];

  // Rich animated category showcase items for scroll experience
  const categoryShowcaseItems = [
    {
      id: 'publication',
      title: 'Research & Publications',
      desc: 'Peer-reviewed international journals, university monographs, research papers, and academic publications.',
      img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      color: 'from-blue-600 to-indigo-700',
      tag: 'Scholarly Research',
      icon: BookOpen,
    },
    {
      id: 'paper_presentation',
      title: 'Paper Presentations',
      desc: 'National & international plenary presentations, keynote discourses, and academic summits.',
      img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
      color: 'from-violet-600 to-purple-700',
      tag: 'Conference Talks',
      icon: FileText,
    },
    {
      id: 'seminar',
      title: 'Seminars & Workshops',
      desc: 'Skill symposiums, executive workshops, technical bootcamps, and scientific roundtables.',
      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      color: 'from-emerald-600 to-teal-700',
      tag: 'Masterclasses',
      icon: Users,
    },
    {
      id: 'college_program',
      title: 'Campus Programs',
      desc: 'Official institutional delegations, committee lead roles, and department leadership symposiums.',
      img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
      color: 'from-sky-600 to-blue-700',
      tag: 'Campus Summits',
      icon: Building,
    },
    {
      id: 'outside_program',
      title: 'Inter-University Events',
      desc: 'State & national external representations, externships, and youth delegation conclaves.',
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      color: 'from-cyan-600 to-teal-700',
      tag: 'National Summits',
      icon: Compass,
    },
    {
      id: 'competition',
      title: 'Competitions & Hackathons',
      desc: 'High-stakes coding sprints, national debate championships, moot courts, and Olympiads.',
      img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      color: 'from-amber-600 to-orange-700',
      tag: 'Campus Arena',
      icon: Trophy,
    },
    {
      id: 'award',
      title: 'Awards & Accolades',
      desc: 'Chancellor medals, presidential merit citations, and university hall of fame honors.',
      img: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80',
      color: 'from-yellow-500 to-amber-600',
      tag: 'Honor Roll',
      icon: Award,
    },
  ];

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return approvedSubmissions.length;
    return approvedSubmissions.filter((s) => s.category === catId).length;
  };

  const currentFeatured = activeFeaturedTitles[currentIndex] || null;

  // Ultra-Dynamic Right-to-Left Slide Transition
  // ("our abhi jitna animated hokar aata hai usse bhi accha dynamic level me animated hokar aana hai our RIGHT SE LEFT hokar aana hai animated me")
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 240 : -240,
      opacity: 0,
      scale: 0.88,
      rotateY: dir >= 0 ? 10 : -10,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.52,
        ease: [0.22, 1, 0.36, 1], // fluid spring-like cubic bezier
      },
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -240 : 240,
      opacity: 0,
      scale: 0.88,
      rotateY: dir >= 0 ? -10 : 10,
      filter: 'blur(8px)',
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="min-w-0 space-y-16 pb-20">
      
      {/* 1. HERO SECTION (DYNAMIC & ANIMATED) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-900 text-white pt-16 pb-24">
        {/* Animated Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Subtle dot matrix pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Optional Announcement Ribbon */}
            {settings.showAnnouncementBar && settings.announcementBarText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-inner"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{settings.announcementBarText}</span>
              </motion.div>
            )}

            {/* Animated Badge */}
            {settings.heroShowBadge !== false && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide backdrop-blur-md shadow-inner"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </motion.div>
                <span>{settings.heroBadgeText || 'Celebrating Student Excellence & Institutional Outreach'}</span>
              </motion.div>
            )}

            {/* Dynamic Headline with Shimmer Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
            >
              {(settings.heroHeadingPrefix && settings.heroHeadingPrefix !== 'Students Outreach Management')
                ? settings.heroHeadingPrefix
                : 'Students Outreach'}{' '}
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-amber-200 to-indigo-300 bg-[length:200%_auto]"
              >
                {(settings.heroHeadingHighlight && settings.heroHeadingHighlight !== 'Software')
                  ? settings.heroHeadingHighlight
                  : 'Dashboard'}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              {settings.heroDescription ||
                'A comprehensive academic platform honouring student achievements, literary publications, research symposiums, collegiate programs, competitions, and merit rankings.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              <motion.button
                id="hero-explore-btn"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = document.getElementById('achievement-gallery-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                {settings.heroPrimaryBtnText || 'Explore Achievements'}
              </motion.button>

              <motion.button
                id="hero-student-login-btn"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowStudentLoginModal(true)}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <GraduationCap className="w-4 h-4" />
                {settings.heroSecondaryBtnText || 'Student Login'}
              </motion.button>
            </motion.div>
          </div>

          {/* DYNAMIC ANIMATED STATISTICS CARDS (Counting up + interactive hover) */}
          {settings.heroShowStats !== false && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 mt-16"
            >
            
            {/* Card 1: Students */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/30 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <CountUpNumber value={totalStudentsCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Students</p>
            </motion.div>

            {/* Card 2: Approved Honors */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/30 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <CountUpNumber value={totalApprovedCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Approved Honors</p>
            </motion.div>

            {/* Card 3: Publications */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/30 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <CountUpNumber value={totalPublicationsCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Publications</p>
            </motion.div>

            {/* Card 4: Total Points */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/30 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                <CountUpNumber value={totalPointsCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Points</p>
            </motion.div>

            {/* Card 5: Programs */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/30 transition-transform">
                <Building className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <CountUpNumber value={totalProgramsCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Programs</p>
            </motion.div>

            {/* Card 6: Competitions */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-400/40 backdrop-blur-md text-center transition-all shadow-md group cursor-default"
            >
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/30 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                <CountUpNumber value={totalCompetitionsCount} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Competitions</p>
            </motion.div>
          </motion.div>
          )}
        </div>
      </section>

      {/* 2. OUR FEATURED STUDENTS SHOWCASE (AUTOPLAYS EVERY 5 SECONDS WITH VISUAL PROGRESS & MOTION) */}
      {settings.featuredStudentsSection && activeFeaturedTitles.length > 0 && currentFeatured && (
        <section
          id="featured-students-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-8 space-y-2"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Institutional Honours & Titles
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Our Featured Students
            </h2>
            <p className="text-sm text-slate-600">
              Students Outreach Dashboard • Conferred by Academic Dean & Outreach Council
            </p>
          </motion.div>

          {/* Featured Student Card with Auto-play Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-gradient-to-br from-white via-slate-50 to-amber-50/40 rounded-3xl border-2 border-amber-200/90 shadow-xl overflow-hidden p-6 sm:p-10 transition-all duration-300"
          >
            
            {/* 5-Second Animated Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100/80 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            {/* Top Right Decorative Gold Ribbons */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-400/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Animated Student Slide with dynamic Right-to-Left entrance */}
            <AnimatePresence mode="wait" custom={direction}>
              {currentFeatured && (() => {
                const matchedStudent = students.find((s) => s.id === currentFeatured.studentId);
                const displayAvatar = matchedStudent?.avatarUrl || currentFeatured.studentAvatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80';
                const displayName = matchedStudent?.name || currentFeatured.studentName;
                const displayCourse = matchedStudent?.course || currentFeatured.studentCourse;
                const displayDept = matchedStudent?.department || currentFeatured.studentDepartment;
                const displayAddress = matchedStudent?.address;
                const displayBio = matchedStudent?.bio || currentFeatured.shortDescription;
                const displayPoints = matchedStudent?.totalPoints ?? 140;
                const displayApproved = matchedStudent?.approvedCount ?? 6;
                const displayRank = matchedStudent?.rank ?? 1;

                return (
                  <motion.div
                    key={currentFeatured.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    
                    {/* Student Large Photo with Rotating Gold Ring & Verified Badge */}
                    <div className="lg:col-span-4 flex flex-col items-center text-center">
                      <div className="relative">
                        
                        {/* Animated Ambient Halo with shimmer */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                          className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 opacity-75 blur-xs"
                        />

                        <motion.div
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.45, ease: 'backOut' }}
                          className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 bg-white shadow-2xl overflow-hidden"
                        >
                          <img
                            src={displayAvatar}
                            alt={displayName || 'Student'}
                            className="w-full h-full object-cover rounded-full transition-transform duration-500 hover:scale-105"
                          />
                        </motion.div>

                        {/* Floating Verified Honoree Badge */}
                        <motion.div
                          initial={{ scale: 0.6, y: 10, opacity: 0 }}
                          animate={{ scale: 1, y: [0, -3, 0], opacity: 1 }}
                          transition={{
                            scale: { duration: 0.35, delay: 0.15 },
                            y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
                          }}
                          className="absolute bottom-2 right-2 sm:right-4 px-3.5 py-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 border border-white/60"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          <span>Verified Honoree</span>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4"
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                          Session {currentFeatured.sessionYear}
                        </span>
                      </motion.div>
                    </div>

                    {/* Student Details & Title with Right-to-Left staggered entrances */}
                    <div className="lg:col-span-8 space-y-4 text-left">
                      
                      {/* Title Chip with Right Entrance */}
                      <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08, duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-100/90 text-amber-900 border border-amber-300 font-black text-xs uppercase tracking-wider shadow-2xs"
                      >
                        <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{currentFeatured.title}</span>
                      </motion.div>

                      {/* Student Name with Right Entrance */}
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, x: 75 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12, duration: 0.45 }}
                          className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                        >
                          {displayName}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, x: 60 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.16, duration: 0.45 }}
                          className="text-sm font-bold text-blue-700 mt-1"
                        >
                          {displayCourse} • {displayDept}
                        </motion.p>
                        {currentFeatured.positionSubtitle && (
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {currentFeatured.positionSubtitle}
                          </p>
                        )}
                        {displayAddress && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-100/90 px-3 py-1 rounded-lg border border-amber-300 w-fit mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Address: {displayAddress}</span>
                          </div>
                        )}
                      </div>

                      {/* Bio Quote with Right Entrance */}
                      <motion.p
                        initial={{ opacity: 0, x: 85 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.20, duration: 0.45 }}
                        className="text-sm sm:text-base text-slate-700 leading-relaxed italic border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/50 rounded-r-2xl shadow-2xs"
                      >
                        "{displayBio}"
                      </motion.p>

                      {/* Score & Achievements Strip with Right Entrance */}
                      <motion.div
                        initial={{ opacity: 0, x: 95 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.24, duration: 0.45 }}
                        className="flex flex-wrap items-center gap-6 sm:gap-8 pt-3 border-t border-slate-200/80"
                      >
                        <div className="bg-blue-50/80 border border-blue-200/60 px-3.5 py-2 rounded-xl">
                          <span className="text-[10px] text-blue-600 uppercase font-extrabold block">Academic Points</span>
                          <span className="text-xl sm:text-2xl font-black text-blue-800">
                            {displayPoints} pts
                          </span>
                        </div>

                        <div className="bg-emerald-50/80 border border-emerald-200/60 px-3.5 py-2 rounded-xl">
                          <span className="text-[10px] text-emerald-600 uppercase font-extrabold block">Verified Honors</span>
                          <span className="text-xl sm:text-2xl font-black text-emerald-800">
                            {displayApproved} Records
                          </span>
                        </div>

                        <div className="bg-amber-50/80 border border-amber-200/60 px-3.5 py-2 rounded-xl">
                          <span className="text-[10px] text-amber-600 uppercase font-extrabold block">Campus Rank</span>
                          <span className="text-xl sm:text-2xl font-black text-amber-700">
                            #{displayRank}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Navigation Controls, Autoplay Indicator, Speed Switcher & Dots */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-slate-200/70">
              
              {/* Pagination Dots with Smooth Expand */}
              <div className="flex items-center gap-2">
                {activeFeaturedTitles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-9 bg-amber-600 shadow-xs'
                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}

                {/* Auto-rotating Status Badge */}
                <div className="ml-2">
                  {isPaused ? (
                    <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1.5 shadow-2xs">
                      <Pause className="w-3 h-3 text-amber-600" /> Paused on hover
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1.5 shadow-2xs">
                      <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span>Auto-rotating ({rotationDuration / 1000}s) • Right-to-Left</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Speed Switcher (2s vs 3s) & Navigation Arrows */}
              <div className="flex items-center gap-3">
                {/* 2s / 2.5s / 3s Speed Options per user request */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
                  <span className="text-slate-400 px-1 font-semibold">Speed:</span>
                  <button
                    type="button"
                    onClick={() => setRotationDuration(2000)}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                      rotationDuration === 2000
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="2 Seconds Rotation"
                  >
                    2s
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationDuration(2500)}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                      rotationDuration === 2500
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="2.5 Seconds Rotation"
                  >
                    2.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationDuration(3000)}
                    className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                      rotationDuration === 3000
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="3 Seconds Rotation"
                  >
                    3s
                  </button>
                </div>

                {/* Prev / Next Arrows */}
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    id="featured-prev-btn"
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
                    title="Previous Student"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    id="featured-next-btn"
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
                    title="Next Student"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* 2.5. DYNAMIC SCROLL ANIMATED CATEGORIES SHOWCASE ("cetegories animated and dynamic hokar aana hai ek dam professinal look dena hai") */}
      <section id="categories-showcase-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 space-y-3"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Categories & Activity Streams</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Academic & Extracurricular Categories
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore diverse streams where students log verified achievements, earn academic honor points, and ascend campus rankings.
          </p>
        </motion.div>

        {/* Dynamic Category Cards Grid with 3D Float, Image Zooms & Staggered Scroll Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {categoryShowcaseItems.map((item, idx) => {
            const Icon = item.icon;
            const count = getCategoryCount(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.6,
                  delay: (idx % 4) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.025,
                  transition: { duration: 0.25, ease: 'easeOut' },
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setGalleryCategory(item.id);
                  const el = document.getElementById('achievement-gallery-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-2xl hover:border-blue-500/60 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Dynamic Category Image with Scroll Reveal & Hover Scale */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <motion.img
                    src={item.img}
                    alt={item.title}
                    initial={{ scale: 1.18, opacity: 0.8 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="w-full h-full object-cover group-hover:scale-115 group-hover:rotate-1 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Gradient & Shimmer Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent group-hover:from-slate-950/95 transition-colors" />
                  
                  {/* Dynamic Glow Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />

                  {/* Top Badge Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/30 shadow-xs">
                      {item.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      {count} Records
                    </span>
                  </div>

                  {/* Icon floating on Image bottom-left */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
                    <span className="flex items-center gap-1">
                      <span>Explore Records</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      +{count * 20} pts
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED PUBLICATIONS & ACHIEVEMENTS HIGHLIGHTS (DYNAMIC & ANIMATED) */}
      {settings.publicPublications && featuredPublications.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Research & Creative Writing
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Student Publications</h2>
            </div>
            <motion.button
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView('publications');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer bg-blue-50 hover:bg-blue-100/70 px-4 py-2 rounded-xl border border-blue-200 transition-colors shadow-2xs"
            >
              <span>View All Publications</span> <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPublications.slice(0, 3).map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, transition: { duration: 0.25 } }}
                onClick={() => setSelectedSubmission(pub)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-2xl hover:border-blue-400 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
              >
                {pub.imageUrl ? (
                  <div className="h-52 w-full overflow-hidden bg-slate-100 relative group/img">
                    <motion.img
                      src={pub.imageUrl}
                      alt={pub.title}
                      initial={{ scale: 1.15 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-[0.5deg] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                    {/* Light sweep reflection */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20 shadow-xs">
                      {pub.subType || 'Article'}
                    </div>
                  </div>
                ) : (
                  <div className="h-52 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-400">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pub.date}</span>
                      <span>•</span>
                      <span className="truncate">{pub.venueOrOrganizer}</span>
                    </p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {pub.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-[10px] shrink-0">
                        {pub.studentName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-700 truncate">{pub.studentName}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px] shadow-2xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      +{pub.awardedPoints} pts
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PUBLIC ACHIEVEMENT GALLERY (FILTERABLE & ANIMATED) */}
      <section id="achievement-gallery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-8 space-y-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Institutional Merit Repository
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Achievement Gallery
          </h2>
          <p className="text-sm text-slate-600">
            Browse verified peer-reviewed publications, national conference presentations, campus sports, and literary honors.
          </p>
        </motion.div>

        {/* Filter Categories with Interactive Animation, Icons & Sliding Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10"
        >
          {galleryCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = galleryCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 15, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGalleryCategory(cat.id)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none border ${
                  isSelected
                    ? 'text-white border-blue-600 shadow-md shadow-blue-600/25'
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Dynamic sliding active background pill */}
                {isSelected && (
                  <motion.div
                    layoutId="activeGalleryTabPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Gallery Grid with Motion and Rich Category Imagery */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredGallerySubs.slice(0, 9).map((sub, idx) => {
              const cardImg = sub.imageUrl || (
                sub.category === 'publication'
                  ? 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'paper_presentation'
                  ? 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'seminar'
                  ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'college_program'
                  ? 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'outside_program'
                  ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'competition'
                  ? 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80'
                  : sub.category === 'award'
                  ? 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80'
                  : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
              );

              return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 35, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.12 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.55,
                    delay: (idx % 3) * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                    layout: { duration: 0.35, ease: 'easeOut' },
                  }}
                  whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.25 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSubmission(sub)}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-2xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between cursor-pointer group overflow-hidden"
                >
                  {/* Image Header with Badge Overlays */}
                  <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100 group/img">
                    <motion.img
                      src={cardImg}
                      alt={sub.title}
                      initial={{ scale: 1.15 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-[0.5deg] transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-85 group-hover:opacity-70 transition-opacity" />

                    {/* Light sweep reflection sweep on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-extrabold uppercase tracking-wider text-[10px] shadow-sm border border-white/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {sub.category.replace('_', ' ')}
                      </span>
                      <span className="font-black text-emerald-950 bg-emerald-300/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] shadow-sm border border-white/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-800" />
                        +{sub.awardedPoints} pts
                      </span>
                    </div>

                    {/* Bottom Image Overlay Label */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] z-10">
                      <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        {sub.venueOrOrganizer || sub.studentName}
                      </span>
                      <span className="text-slate-300 text-[10px] shrink-0 font-medium">{sub.date}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 line-clamp-2 leading-snug transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>

                    {/* Card Footer with Student & Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-800 flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs">
                          {sub.studentName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 truncate">{sub.studentName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs group-hover:translate-x-1 transition-transform shrink-0">
                        <span>View Proof</span>
                        <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredGallerySubs.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No approved achievements found for this category yet.</p>
          </div>
        )}
      </section>

      {/* 5. CAMPUS LEADERBOARD PREVIEW */}
      {settings.publicLeaderboard && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden"
          >
            {/* Ambient Background Decorative Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Campus Standings
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Student Leaderboard Preview</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveView('leaderboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Full Leaderboard Standings</span> <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-3 relative z-10">
              {students.slice(0, 5).map((std, idx) => (
                <motion.div
                  key={std.id}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.015, x: 4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 transition-colors shadow-2xs group ${std.isPublicProfileEnabled ? "cursor-pointer hover:bg-white/10" : ""}`}
                  onClick={() => { if (std.isPublicProfileEnabled) setSelectedStudentForProfile(std); }}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 text-center font-black text-amber-400 text-sm sm:text-base">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <img
                      src={std.avatarUrl}
                      alt={std.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-600 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{std.name}</h4>
                      <p className="text-[11px] text-slate-400">{std.course} • {std.department}</p>
                      {std.address && (
                        <p className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                          <span>{std.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-amber-300 block">{std.totalPoints} pts</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{std.approvedCount} Honors</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Modal for Viewing Full Achievement Details */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white relative">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                  {selectedSubmission.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-extrabold text-emerald-300">
                  +{selectedSubmission.awardedPoints} Academic Points
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">{selectedSubmission.title}</h3>
              <p className="text-xs text-blue-200 mt-1 font-medium">
                Conferred upon {selectedSubmission.studentName} ({selectedSubmission.studentAdmissionNumber})
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Full Image Banner */}
              <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative group">
                <img
                  src={
                    selectedSubmission.imageUrl ||
                    (selectedSubmission.category === 'publication'
                      ? 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'paper_presentation'
                      ? 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'seminar'
                      ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'college_program'
                      ? 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'outside_program'
                      ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'competition'
                      ? 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
                      : selectedSubmission.category === 'award'
                      ? 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1200&q=80'
                      : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')
                  }
                  alt={selectedSubmission.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-white font-bold text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Document / Institutional Proof</span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Awarded Scholar</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block mt-0.5">
                    {selectedSubmission.studentName}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Event / Venue</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block mt-0.5">
                    {selectedSubmission.venueOrOrganizer || 'Campus Record'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verification Date</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block mt-0.5">
                    {selectedSubmission.date}
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Official Record Details & Citation
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {selectedSubmission.description}
                </p>
              </div>

              {/* Admin Note if any */}
              {selectedSubmission.adminReviewNote && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-blue-900 uppercase text-[10px] block">
                    Review Committee Remark
                  </span>
                  <p className="text-blue-800">{selectedSubmission.adminReviewNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {selectedSubmission.externalLink && (
                  <a
                    href={selectedSubmission.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open External Publication / Link</span>
                  </a>
                )}

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {selectedStudentForProfile && (
        <PublicStudentProfileModal
          student={selectedStudentForProfile}
          submissions={submissions.filter(s => s.studentId === selectedStudentForProfile.id)}
          certificates={certificates}
          featuredTitles={featuredTitles}
          badges={badges}
          onClose={() => setSelectedStudentForProfile(null)}
        />
      )}

    </div>
  );
};
