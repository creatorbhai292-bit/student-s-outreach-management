const fs = require('fs');
let data = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const replacement = `
    { id: 'students', label: 'Student Accounts', icon: Users, badge: students.length },
    { id: 'public-profiles', label: 'Public Profiles', icon: UserCircle },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
`;

data = data.replace(
  "{ id: 'students', label: 'Student Accounts', icon: Users, badge: students.length },",
  replacement
);

// We need to import UserCircle and Megaphone if not already imported
if (!data.includes('UserCircle')) {
  data = data.replace(
    'Users,',
    'Users,\n  UserCircle,\n  Megaphone,'
  );
}

fs.writeFileSync('src/components/AdminPanel.tsx', data);
console.log('AdminPanel.tsx tabs updated');
