const fs = require('fs');

let data = fs.readFileSync('src/components/LeaderboardView.tsx', 'utf8');

// Add Import
if (!data.includes('MonthlyReportSection')) {
  data = data.replace(
    "import { PublicStudentProfileModal } from './PublicStudentProfileModal';",
    "import { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { MonthlyReportSection } from './MonthlyReportSection';"
  );
}

// Add the section before the main closing tags.
// Let's find the closing of the main max-w-7xl div.
// It seems the end is around `</motion.div>\n    </div>\n  );\n};` or something similar.
// Wait, I should just search for the modalRender string that I injected earlier.

const modalRender = `{selectedStudentForProfile && (
        <PublicStudentProfileModal`;

if (!data.includes('<MonthlyReportSection')) {
  data = data.replace(
    modalRender,
    `<MonthlyReportSection onStudentClick={(id) => {
          const std = students.find(s => s.id === id);
          if (std) setSelectedStudentForProfile(std);
        }} />\n\n      ` + modalRender
  );
}

fs.writeFileSync('src/components/LeaderboardView.tsx', data);
