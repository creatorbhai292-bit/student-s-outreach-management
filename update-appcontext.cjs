const fs = require('fs');
let data = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add Announcement import
data = data.replace(
  '  AppSettings,',
  '  AppSettings,\n  Announcement,'
);

// Add announcements to AppContextType
data = data.replace(
  '  settings: AppSettings;',
  '  settings: AppSettings;\n  announcements: Announcement[];'
);

data = data.replace(
  '  updateSettings: (s: AppSettings) => Promise<void>;',
  '  updateSettings: (s: AppSettings) => Promise<void>;\n  saveAnnouncement: (a: Announcement) => Promise<void>;\n  deleteAnnouncement: (id: string) => Promise<void>;'
);

// Add state for announcements
data = data.replace(
  '  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);',
  '  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);\n  const [announcements, setAnnouncements] = useState<Announcement[]>([]);'
);

// Load announcements
data = data.replace(
  '        const storedSettings = await getAllFromStore<AppSettings>(STORES.SETTINGS);',
  '        const storedSettings = await getAllFromStore<AppSettings>(STORES.SETTINGS);\n        const storedAnnouncements = await getAllFromStore<Announcement>(STORES.ANNOUNCEMENTS);\n        if (storedAnnouncements.length > 0) setAnnouncements(storedAnnouncements.sort((a,b) => a.displayOrder - b.displayOrder));'
);

// Define CRUD functions for announcements
const announcementFunctions = `
  const saveAnnouncement = async (announcement: Announcement) => {
    const nextAnnouncements = announcements.some((a) => a.id === announcement.id)
      ? announcements.map((a) => (a.id === announcement.id ? announcement : a))
      : [...announcements, announcement];
    setAnnouncements(nextAnnouncements.sort((a, b) => a.displayOrder - b.displayOrder));
    await putInStore(STORES.ANNOUNCEMENTS, announcement);
    showToast('Announcement saved.', 'success');
  };

  const deleteAnnouncement = async (id: string) => {
    const nextAnnouncements = announcements.filter((a) => a.id !== id);
    setAnnouncements(nextAnnouncements);
    await deleteFromStore(STORES.ANNOUNCEMENTS, id);
    showToast('Announcement deleted.', 'info');
  };
`;

data = data.replace(
  '  // Full Database Reset to Default',
  announcementFunctions + '\n  // Full Database Reset to Default'
);

// Add to context provider value
data = data.replace(
  '        settings,',
  '        settings,\n        announcements,'
);

data = data.replace(
  '        updateSettings,',
  '        updateSettings,\n        saveAnnouncement,\n        deleteAnnouncement,'
);

fs.writeFileSync('src/context/AppContext.tsx', data);
console.log('AppContext.tsx updated');
