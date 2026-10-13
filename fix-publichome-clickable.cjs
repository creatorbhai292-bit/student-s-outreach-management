const fs = require('fs');
let data = fs.readFileSync('src/components/PublicHome.tsx', 'utf8');

// For featured student card
data = data.replace(
  'className="bg-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row shadow-2xl relative border border-slate-200/60 items-center gap-8 md:gap-12 overflow-hidden"',
  'className={`bg-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row shadow-2xl relative border border-slate-200/60 items-center gap-8 md:gap-12 overflow-hidden ${matchedStudent?.isPublicProfileEnabled ? "cursor-pointer hover:border-blue-300 transition-colors" : ""}`}\n              onClick={() => { if (matchedStudent?.isPublicProfileEnabled) setSelectedStudentForProfile(matchedStudent); }}'
);

// For mini leaderboard on home page
data = data.replace(
  'className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 transition-colors shadow-2xs cursor-pointer group"',
  'className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 transition-colors shadow-2xs group ${s.isPublicProfileEnabled ? "cursor-pointer hover:bg-white/10" : ""}`}\n                  onClick={() => { if (s.isPublicProfileEnabled) setSelectedStudentForProfile(s); }}'
);

fs.writeFileSync('src/components/PublicHome.tsx', data);
