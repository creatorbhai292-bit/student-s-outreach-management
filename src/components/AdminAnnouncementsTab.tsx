import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement } from '../types';
import { Plus, Edit, Trash2, Save, X, Megaphone, Link as LinkIcon, MoveUp, MoveDown } from 'lucide-react';

interface Props {
  announcements: Announcement[];
  saveAnnouncement: (a: Announcement) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

export const AdminAnnouncementsTab: React.FC<Props> = ({ announcements, saveAnnouncement, deleteAnnouncement }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setLink('');
    setIsActive(true);
    setDisplayOrder(1);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setMessage(ann.message);
    setLink(ann.link || '');
    setIsActive(ann.isActive);
    setDisplayOrder(ann.displayOrder);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!title || !message) return;
    const ann: Announcement = {
      id: editingId || `ann-${Date.now()}`,
      title,
      message,
      link,
      isActive,
      displayOrder,
      createdAt: editingId ? undefined : new Date().toISOString(), // Keep original if editing, but we don't have it easily here so let's just say Date.now() if needed, actually we can just find it
      updatedAt: new Date().toISOString(),
    } as Announcement;
    
    if (editingId) {
       const existing = announcements.find(a => a.id === editingId);
       if (existing) ann.createdAt = existing.createdAt;
    } else {
       ann.createdAt = new Date().toISOString();
    }

    await saveAnnouncement(ann);
    resetForm();
  };

  const moveOrder = async (ann: Announcement, dir: number) => {
    await saveAnnouncement({ ...ann, displayOrder: ann.displayOrder + dir });
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notices & Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">Manage scrolling announcement banner across the public website.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title (Internal reference)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Exam Schedule Update"
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Public Message (Marquee text)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="📢 Submissions for Annual Achievement Awards are now open."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Optional Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Display Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex-1 flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={!title || !message}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Notice
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {sortedAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Megaphone className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium">No announcements found.</p>
            <p className="text-sm mt-1">Create one to display a scrolling banner on the home page.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAnnouncements.map((ann) => (
                <tr key={ann.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-center font-bold text-slate-700">{ann.displayOrder}</span>
                      <div className="flex flex-col">
                        <button onClick={() => moveOrder(ann, -1)} className="p-0.5 text-slate-400 hover:text-blue-600"><MoveUp className="w-3 h-3" /></button>
                        <button onClick={() => moveOrder(ann, 1)} className="p-0.5 text-slate-400 hover:text-blue-600"><MoveDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-md">{ann.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ann.title} {ann.link && <LinkIcon className="inline w-3 h-3 ml-1" />}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${ann.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {ann.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(ann)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAnnouncement(ann.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
