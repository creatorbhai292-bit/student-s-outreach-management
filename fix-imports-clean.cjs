const fs = require('fs');

function fixFile(file) {
  let data = fs.readFileSync(file, 'utf8');
  // Remove the corrupted import
  data = data.replace("import {\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';", "import {");
  data = data.replace("import { Student } from '../types';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';", "");
  data = data.replace("import {\nimport { Student } from '../types';", "import {");
  
  // Just inject at the very top after the license
  data = data.replace(
    "import React",
    "import React from 'react';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { Student } from '../types';\n// REPLACE-MARKER"
  );
  data = data.replace("import React from 'react';\n// REPLACE-MARKER", ""); // remove duplicate if any

  fs.writeFileSync(file, data);
}

fixFile('src/components/LeaderboardView.tsx');
fixFile('src/components/PublicHome.tsx');
