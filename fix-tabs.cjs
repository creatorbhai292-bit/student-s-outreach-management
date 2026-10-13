const fs = require('fs');

let pubProf = fs.readFileSync('src/components/AdminPublicProfilesTab.tsx', 'utf8');
pubProf = pubProf.replace(/\\\`/g, '`');
pubProf = pubProf.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/AdminPublicProfilesTab.tsx', pubProf);

let annTab = fs.readFileSync('src/components/AdminAnnouncementsTab.tsx', 'utf8');
annTab = annTab.replace(/\\\`/g, '`');
annTab = annTab.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/AdminAnnouncementsTab.tsx', annTab);

console.log('Fixed escape characters in both files');
