const fs = require('fs');

function fix(filePath) {
  let data = fs.readFileSync(filePath, 'utf8');
  
  // Clean up messes
  data = data.replace("import React from 'react';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { Student } from '../types';\n// REPLACE-MARKER, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';");
  data = data.replace("import React from 'react';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { Student } from '../types';\n// REPLACE-MARKER, { useState, useEffect, useMemo, useRef } from 'react';", "import React, { useState, useEffect, useMemo, useRef } from 'react';\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { Student } from '../types';");
  
  // Clean duplicates
  data = data.replace("import { Student, ActivitySubmission } from '../types';", "import { ActivitySubmission } from '../types';");
  data = data.replace("import { Student, ActivitySubmission, PointRule, FeaturedStudentTitle, AchievementBadge } from '../types';", "import { ActivitySubmission, PointRule, FeaturedStudentTitle, AchievementBadge } from '../types';");
  
  fs.writeFileSync(filePath, data);
}

fix('src/components/LeaderboardView.tsx');
fix('src/components/PublicHome.tsx');
