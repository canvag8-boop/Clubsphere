import React, { useState, useEffect } from 'react';
import type { Event } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Trash2, Edit3, Loader2 } from 'lucide-react';

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, isOpen, onClose, onUpdated }) => {
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [pointsValue, setPointsValue] = useState(50);
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [status, setStatus] = useState('upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setTime(event.time);
      setLocation(event.location);
      setPointsValue(event.points_value);
      setMaxCapacity(event.max_capacity);
      setStatus(event.status);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !time || !location.trim()) {
      error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.updateEvent(event.id, {
        title: title.trim(),
        description: description.trim(),
        date,
        time: time.trim(),
        location: location.trim(),
        pointsValue: Number(pointsValue),
        maxCapacity: Number(maxCapacity),
        status,
      });

      success('Event Updated!', res.message || 'Event details updated successfully.');
      onUpdated();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete event "${event.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await apiService.deleteEvent(event.id);
      success('Event Deleted', res.message);
      onUpdated();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to delete event');
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
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Event Management</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Edit Campus Event</h2>
          <p className="text-xs text-white/70 mt-1">Modify event schedule, title, points, or delete</p>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Lab <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Points Value
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={pointsValue}
                onChange={(e) => setPointsValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Capacity
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
              Delete Event
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
