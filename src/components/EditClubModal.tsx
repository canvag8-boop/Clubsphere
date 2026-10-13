import React, { useState, useEffect } from 'react';
import type { Club } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Trash2, Edit3, Loader2 } from 'lucide-react';

interface EditClubModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const CATEGORIES = [
  'Technology & Development',
  'Engineering & Hardware',
  'Fitness & Athletics',
  'Arts & Performance',
  'Media & Design',
  'Academics & Science',
  'Social & Community',
];

const GRADIENTS = [
  { label: 'Royal Navy to Indigo', value: 'from-blue-600 to-indigo-700' },
  { label: 'Cyber Violet', value: 'from-indigo-600 to-purple-700' },
  { label: 'Emerald Forest', value: 'from-emerald-600 to-teal-700' },
  { label: 'Sunset Amber', value: 'from-amber-500 to-orange-600' },
  { label: 'Rose Acoustic', value: 'from-rose-500 to-indigo-600' },
];

const ICONS = ['Code', 'Cpu', 'Trophy', 'Music', 'Camera', 'Sparkles', 'Users', 'Flame', 'Compass', 'BookOpen'];

export const EditClubModal: React.FC<EditClubModalProps> = ({ club, isOpen, onClose, onUpdated }) => {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [bannerGradient, setBannerGradient] = useState(GRADIENTS[0].value);
  const [logoIcon, setLogoIcon] = useState(ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (club) {
      setName(club.name);
      setCategory(club.category);
      setDescription(club.description);
      setLocation(club.location);
      setMeetingSchedule(club.meeting_schedule);
      setBannerGradient(club.banner_gradient || GRADIENTS[0].value);
      setLogoIcon(club.logo_icon || ICONS[0]);
    }
  }, [club]);

  if (!isOpen || !club) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      error('Please provide a name and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.updateClub(club.id, {
        name: name.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        meetingSchedule: meetingSchedule.trim(),
        bannerGradient,
        logoIcon,
      });

      success('Club Updated!', res.message || `Club renamed to "${name}"`);
      onUpdated();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update club');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${club.name}" and all its records?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await apiService.deleteClub(club.id);
      success('Club Deleted', res.message);
      onUpdated();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to delete club');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-500/30 text-indigo-300">
              <Edit3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Super Admin Controls</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Edit Club Details & Name</h2>
          <p className="text-xs text-white/70 mt-1">Modify name, schedules, categories, or remove club</p>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Club Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & Robotics Guild"
              required
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Club Icon
              </label>
              <select
                value={logoIcon}
                onChange={(e) => setLogoIcon(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Meeting Schedule
              </label>
              <input
                type="text"
                value={meetingSchedule}
                onChange={(e) => setMeetingSchedule(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Lab
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Card Gradient Theme
            </label>
            <select
              value={bannerGradient}
              onChange={(e) => setBannerGradient(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {GRADIENTS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Club
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
