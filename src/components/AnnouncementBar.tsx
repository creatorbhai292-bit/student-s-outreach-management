import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone } from 'lucide-react';
import { Announcement } from '../types';

interface Props {
  announcements: Announcement[];
}

export const AnnouncementBar: React.FC<Props> = ({ announcements }) => {
  const activeAnnouncements = announcements
    .filter((a) => a.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (activeAnnouncements.length === 0) return null;

  const currentAnnouncement = activeAnnouncements[currentIndex % activeAnnouncements.length];

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white overflow-hidden relative border-b border-blue-900/40 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center">
        <div className="flex items-center gap-2 shrink-0 mr-4 z-10 bg-inherit pr-3 border-r border-blue-500/30">
          <Megaphone className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 hidden sm:inline-block">
            Announcement
          </span>
        </div>

        <div className="flex-1 relative h-6 overflow-hidden flex items-center">
          {/* Subtle edge fade masks for smooth entry and exit */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-blue-700 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-blue-800 to-transparent z-10 pointer-events-none" />

          <motion.div
            key={`${currentAnnouncement.id || 'ann'}-${currentIndex}`}
            initial={{ x: '100%' }}
            animate={{ x: ['100%', '8%', '-22%', '-105%'] }}
            transition={{
              duration: 26,
              times: [0, 0.14, 0.82, 1],
              ease: ['easeOut', 'linear', 'easeIn'],
            }}
            onAnimationComplete={() => {
              setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
            }}
            className="absolute whitespace-nowrap inline-flex items-center gap-3 text-sm font-medium"
          >
            {currentAnnouncement.title && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide shadow-xs shrink-0">
                {currentAnnouncement.title}
              </span>
            )}
            <span className="text-white/95 font-medium tracking-wide text-sm">
              {currentAnnouncement.message}
            </span>
            {currentAnnouncement.link && (
              <a
                href={currentAnnouncement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-300 hover:text-white transition-colors text-xs font-semibold ml-1 shrink-0"
              >
                Learn More
              </a>
            )}
          </motion.div>
        </div>

        {activeAnnouncements.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-blue-500/30 text-[11px] text-blue-200">
            <span>
              {(currentIndex % activeAnnouncements.length) + 1}/{activeAnnouncements.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

