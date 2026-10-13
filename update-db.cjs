const fs = require('fs');
let data = fs.readFileSync('src/lib/db.ts', 'utf8');

if (!data.includes("ANNOUNCEMENTS: 'announcements'")) {
  data = data.replace(
    "SETTINGS: 'settings',",
    "SETTINGS: 'settings',\n  ANNOUNCEMENTS: 'announcements',"
  );
  
  data = data.replace(
    "const DB_VERSION = 2;",
    "const DB_VERSION = 3;"
  );

  data = data.replace(
    "db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });",
    "db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });\n        if (!db.objectStoreNames.contains(STORES.ANNOUNCEMENTS)) db.createObjectStore(STORES.ANNOUNCEMENTS, { keyPath: 'id' });"
  );
  
  fs.writeFileSync('src/lib/db.ts', data);
  console.log('db.ts updated');
}
