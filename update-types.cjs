const fs = require('fs');
let data = fs.readFileSync('src/types.ts', 'utf8');

// Add Announcement interface
if (!data.includes('export interface Announcement')) {
  data += `
export interface Announcement {
  id: string;
  title: string;
  message: string;
  link?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
`;
}

// Add public profile flags to Student interface
data = data.replace(
  '  bio?: string;',
  '  bio?: string;\n  isPublicProfileEnabled?: boolean;\n  publicBio?: string;'
);

fs.writeFileSync('src/types.ts', data);
console.log('types.ts updated');
