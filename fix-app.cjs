const fs = require('fs');
let data = fs.readFileSync('src/App.tsx', 'utf8');
data = data.replace('const { activeView, isLoading } = useApp();', 'const { activeView, isLoading, announcements } = useApp();');
fs.writeFileSync('src/App.tsx', data);
