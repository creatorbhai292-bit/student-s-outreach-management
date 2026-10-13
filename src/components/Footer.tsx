/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveView, triggerLogoClick } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Institutional Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div 
                onClick={triggerLogoClick} 
                className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:bg-blue-500 transition-colors"
                title="Institutional Crest"
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Darul Huda Islamic University</h3>
                <p className="text-xs text-slate-400 font-medium">Students Outreach Dashboard</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {settings.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Institutional IndexedDB Persistence Active • Offline-Capable Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Academic Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveView('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('achievements')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Achievements Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('publications')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Student Publications
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('leaderboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Campus Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accreditation & About
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact & Office</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{settings.address || 'Darul Huda Islamic University, Chemmad'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`tel:${(settings.phone || '8521367782').replace(/[^0-9+]/g, '')}`}
                  className="hover:text-blue-300 transition-colors"
                >
                  {settings.phone || '8521367782'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`mailto:${settings.email || 'outreach@dhiu.in'}`}
                  className="hover:text-blue-300 transition-colors"
                >
                  {settings.email || 'outreach@dhiu.in'}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Darul Huda Islamic University. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Students Outreach Dashboard</span>
            <span>Tamper-Proof QR Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
