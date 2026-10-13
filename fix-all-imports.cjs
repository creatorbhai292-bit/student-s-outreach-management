const fs = require('fs');

let pbData = fs.readFileSync('src/components/PublicHome.tsx', 'utf8');
if (!pbData.includes('import { PublicStudentProfileModal }')) {
    pbData = pbData.replace(
        "import React",
        "import React"
    );
    // Find last import
    const lastImportIndex = pbData.lastIndexOf("import ");
    const nextLineIndex = pbData.indexOf("\n", lastImportIndex);
    pbData = pbData.slice(0, nextLineIndex) + "\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\n" + pbData.slice(nextLineIndex);
}

pbData = pbData.replace(/s\.isPublicProfileEnabled/g, 'std.isPublicProfileEnabled');
pbData = pbData.replace(/setSelectedStudentForProfile\(s\)/g, 'setSelectedStudentForProfile(std)');

fs.writeFileSync('src/components/PublicHome.tsx', pbData);

let lbData = fs.readFileSync('src/components/LeaderboardView.tsx', 'utf8');
if (!lbData.includes('import { PublicStudentProfileModal }')) {
    const lastImportIndex = lbData.lastIndexOf("import ");
    const nextLineIndex = lbData.indexOf("\n", lastImportIndex);
    lbData = lbData.slice(0, nextLineIndex) + "\nimport { PublicStudentProfileModal } from './PublicStudentProfileModal';\n" + lbData.slice(nextLineIndex);
}
fs.writeFileSync('src/components/LeaderboardView.tsx', lbData);

