const fs = require('fs');
let data = fs.readFileSync('src/components/PublicHome.tsx', 'utf8');

// Imports
if (!data.includes('PublicStudentProfileModal')) {
  data = data.replace(
    "import { motion, AnimatePresence } from 'framer-motion';",
    "import { motion, AnimatePresence } from 'framer-motion';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';"
  );
}

if (!data.includes('const [selectedStudentForProfile, setSelectedStudentForProfile] = useState')) {
  data = data.replace(
    "const [galleryCategory, setGalleryCategory] = useState<string>('all');",
    "const [galleryCategory, setGalleryCategory] = useState<string>('all');\n  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);"
  );
}

// Render Modal at the end of PublicHome
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

fs.writeFileSync('src/components/PublicHome.tsx', data);
console.log('PublicHome updated');
