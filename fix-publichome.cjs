const fs = require('fs');
let data = fs.readFileSync('src/components/PublicHome.tsx', 'utf8');

data = data.replace(
  '    setShowStudentLoginModal,',
  '    setShowStudentLoginModal,\n    certificates,\n    badges,'
);

// fix variable from s to std
data = data.replace(
  's.isPublicProfileEnabled',
  'std.isPublicProfileEnabled'
);
data = data.replace(
  's.isPublicProfileEnabled',
  'std.isPublicProfileEnabled'
);
data = data.replace(
  's.isPublicProfileEnabled',
  'std.isPublicProfileEnabled'
);
data = data.replace(
  's.isPublicProfileEnabled',
  'std.isPublicProfileEnabled'
);

// Fix Student import
if (!data.includes('import { Student } from')) {
    data = data.replace(
      "import { Trophy",
      "import { Student } from '../types';\nimport { Trophy"
    );
}

fs.writeFileSync('src/components/PublicHome.tsx', data);
