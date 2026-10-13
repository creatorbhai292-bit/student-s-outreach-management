const fs = require('fs');
function fix(file) {
    let data = fs.readFileSync(file, 'utf8');
    // Remove all my previous messes
    data = data.replace(/import React from 'react';\nimport \{ PublicStudentProfileModal \} from '\.\/PublicStudentProfileModal';\nimport \{ Student \} from '\.\.\/types';\n\/\/ REPLACE-MARKER/g, 'import React');
    
    // Make sure we have React correctly
    data = data.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';");
    
    // Add imports right after Apache license
    data = data.replace(
        "import React",
        "import { PublicStudentProfileModal } from './PublicStudentProfileModal';\nimport { Student } from '../types';\nimport React"
    );
    
    // Fix that weird import { \n Trophy
    data = data.replace("import {\n  Trophy", "import {\n  Trophy");
    
    fs.writeFileSync(file, data);
}
fix('src/components/LeaderboardView.tsx');
fix('src/components/PublicHome.tsx');
