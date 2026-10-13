const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');

if (!data.includes("import { AnnouncementBar }")) {
  data = data.replace(
    "import { Footer } from './components/Footer';",
    "import { Footer } from './components/Footer';\nimport { AnnouncementBar } from './components/AnnouncementBar';"
  );
}

if (data.includes('<Header />')) {
  data = data.replace(
    '<Header />',
    '<Header />\n      <AnnouncementBar announcements={announcements} />'
  );
}

if (!data.includes('const { activeView, loading, announcements } = useApp();')) {
    data = data.replace(
        'const { activeView, loading } = useApp();',
        'const { activeView, loading, announcements } = useApp();'
    );
}

fs.writeFileSync('src/App.tsx', data);
console.log('App.tsx updated');
