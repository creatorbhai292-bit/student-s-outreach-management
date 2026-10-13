const fs = require('fs');
let pbData = fs.readFileSync('src/components/PublicHome.tsx', 'utf8');

if (!pbData.includes('import { Student }')) {
    const lastImportIndex = pbData.lastIndexOf("import ");
    const nextLineIndex = pbData.indexOf("\n", lastImportIndex);
    pbData = pbData.slice(0, nextLineIndex) + "\nimport { Student } from '../types';\n" + pbData.slice(nextLineIndex);
}

fs.writeFileSync('src/components/PublicHome.tsx', pbData);
