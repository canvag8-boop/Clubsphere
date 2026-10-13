import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClubCreated: () => void;
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

export const CreateClubModal: React.FC<CreateClubModalProps> = ({ isOpen, onClose, onClubCreated }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [bannerGradient, setBannerGradient] = useState(GRADIENTS[0].value);
  const [logoIcon, setLogoIcon] = useState(ICONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      error('Please provide a club name and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          location: location.trim() || 'Student Activity Center',
          meetingSchedule: meetingSchedule.trim() || 'Weekly Wednesdays 5:00 PM',
          bannerGradient,
          logoIcon,
          leadCoordinatorId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create club');

      success('Club Created!', `${name} is now listed in the college directory.`);
      onClubCreated();
      onClose();
      // Reset
      setName('');
      setDescription('');
      setLocation('');
      setMeetingSchedule('');
    } catch (err: any) {
      error(err.message || 'Error creating club');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-navy-900 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Admin Console</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Register New College Club</h2>
          <p className="text-xs text-white/70 mt-1">Add an official student organization to ClubSphere directory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Club Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI & Machine Learning Guild"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              placeholder="Mission statement, activities, who should join..."
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
                placeholder="e.g. Every Friday, 5:00 PM"
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
                placeholder="e.g. CS Lab 204 or Arena"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Theme Style
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

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
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
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
