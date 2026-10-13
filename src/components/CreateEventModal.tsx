import React, { useState } from 'react';
import { Club } from '../types';
import { X, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CreateEventModalProps {
  clubs: Club[];
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ clubs, isOpen, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [pointsValue, setPointsValue] = useState(50);
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !time || !location.trim()) {
      error('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: clubId || clubs[0]?.id,
          title: title.trim(),
          description: description.trim(),
          date,
          time,
          location: location.trim(),
          pointsValue: Number(pointsValue) || 50,
          maxCapacity: Number(maxCapacity) || 100,
          createdBy: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');

      success('Event Scheduled!', `"${title}" has been published.`);
      onEventCreated();
      onClose();

      // Reset
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
    } catch (err: any) {
      error(err.message || 'Error creating event');
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
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Event Organizer</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Schedule New Event</h2>
          <p className="text-xs text-white/70 mt-1">Host an upcoming workshop, tournament, or meetup</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Host Club <span className="text-rose-500">*</span>
            </label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Fullstack Hackathon"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn or do? Include rules or requirements..."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 05:00 PM - 07:30 PM"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Venue <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Innovation Hall 101 or Main Ground"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Attendance Points
              </label>
              <input
                type="number"
                min="10"
                max="500"
                step="5"
                value={pointsValue}
                onChange={(e) => setPointsValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Capacity Limit
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
