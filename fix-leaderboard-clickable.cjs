const fs = require('fs');
let data = fs.readFileSync('src/components/LeaderboardView.tsx', 'utf8');

// Add imports
if (!data.includes('PublicStudentProfileModal')) {
  data = data.replace(
    "import { motion } from 'framer-motion';",
    "import { motion, AnimatePresence } from 'framer-motion';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';"
  );
}

// Add state
if (!data.includes('selectedStudentForProfile')) {
  data = data.replace(
    "const [departmentFilter, setDepartmentFilter] = useState('all');",
    "const [departmentFilter, setDepartmentFilter] = useState('all');\n  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);"
  );
}

// Make leaderboard rows clickable
data = data.replace(
  'className="hover:bg-slate-50 transition-colors"',
  'className={`hover:bg-slate-50 transition-colors ${student.isPublicProfileEnabled ? "cursor-pointer" : ""}`}\n                      onClick={() => { if (student.isPublicProfileEnabled) setSelectedStudentForProfile(student); }}'
);

// Add modal render
const modalRender = `
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
`;

if (!data.includes('<PublicStudentProfileModal')) {
  data = data.replace(
    "    </div>\n  );\n};",
    modalRender + "\n    </div>\n  );\n};"
  );
}

fs.writeFileSync('src/components/LeaderboardView.tsx', data);
