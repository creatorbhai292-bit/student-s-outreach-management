const fs = require('fs');
let data = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Imports
if (!data.includes('AdminPublicProfilesTab')) {
  data = data.replace(
    "import { VerificationModal } from './VerificationModal';",
    "import { VerificationModal } from './VerificationModal';\nimport { AdminPublicProfilesTab } from './AdminPublicProfilesTab';\nimport { AdminAnnouncementsTab } from './AdminAnnouncementsTab';"
  );
}

// Render blocks
const publicProfilesRender = `
        {activeAdminTab === 'public-profiles' && (
          <AdminPublicProfilesTab
            students={students}
            updateStudent={updateStudent}
            badges={badges}
            featuredTitles={featuredTitles}
          />
        )}
`;

const announcementsRender = `
        {activeAdminTab === 'announcements' && (
          <AdminAnnouncementsTab
            announcements={announcements}
            saveAnnouncement={saveAnnouncement}
            deleteAnnouncement={deleteAnnouncement}
          />
        )}
`;

if (!data.includes("activeAdminTab === 'public-profiles'")) {
  data = data.replace(
    "{activeAdminTab.startsWith('modules-') && (",
    publicProfilesRender + '\n' + announcementsRender + '\n        {activeAdminTab.startsWith(\'modules-\') && ('
  );
}

fs.writeFileSync('src/components/AdminPanel.tsx', data);
console.log('AdminPanel updated with new tab content');
