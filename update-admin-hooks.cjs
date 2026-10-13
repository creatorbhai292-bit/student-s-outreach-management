const fs = require('fs');
let data = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

data = data.replace(
  '    updateStudent,',
  '    updateStudent,\n    announcements,\n    saveAnnouncement,\n    deleteAnnouncement,'
);

fs.writeFileSync('src/components/AdminPanel.tsx', data);
console.log('AdminPanel hooks updated');
