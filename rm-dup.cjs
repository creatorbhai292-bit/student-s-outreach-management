const fs = require('fs');

function fix(file) {
    let lines = fs.readFileSync(file, 'utf8').split('\n');
    let seen = new Set();
    let out = [];
    for (let l of lines) {
        if (l.includes('import { PublicStudentProfileModal }')) {
            if (seen.has('PublicStudentProfileModal')) continue;
            seen.add('PublicStudentProfileModal');
        }
        if (l.includes("import { Student } from '../types';")) {
            if (seen.has('StudentTypes')) continue;
            seen.add('StudentTypes');
        }
        out.push(l);
    }
    fs.writeFileSync(file, out.join('\n'));
}

fix('src/components/LeaderboardView.tsx');
fix('src/components/PublicHome.tsx');
