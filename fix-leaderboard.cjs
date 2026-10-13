const fs = require('fs');
let data = fs.readFileSync('src/components/LeaderboardView.tsx', 'utf8');

data = data.replace(
  'const { students, submissions, settings } = useApp();',
  'const { students, submissions, settings, certificates, featuredTitles, badges } = useApp();'
);

if (!data.includes('import { Student } from')) {
    data = data.replace(
      "import { motion, AnimatePresence } from 'framer-motion';",
      "import { motion, AnimatePresence } from 'framer-motion';\nimport { Student } from '../types';"
    );
}

fs.writeFileSync('src/components/LeaderboardView.tsx', data);
