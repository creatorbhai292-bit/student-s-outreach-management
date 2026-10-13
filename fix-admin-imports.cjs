const fs = require('fs');
let data = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

data = data.replace(
  "import { fileToBase64 } from '../lib/db';",
  "import { fileToBase64 } from '../lib/db';\nimport { AdminPublicProfilesTab } from './AdminPublicProfilesTab';\nimport { AdminAnnouncementsTab } from './AdminAnnouncementsTab';"
);

fs.writeFileSync('src/components/AdminPanel.tsx', data);
