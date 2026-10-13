import React, { useState } from 'react';
import { Event } from '../types';
import { Calendar, Clock, MapPin, Sparkles, Users, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerPointsCelebration } from '../utils/confetti';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
  onOpenAttendance?: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onActionComplete,
  onOpenAttendance,
}) => {
  const { user, role, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !event) return null;

  const capacityPercent = Math.min(100, Math.round((event.registered_count / event.max_capacity) * 100));
  const isFull = event.registered_count >= event.max_capacity;

  const handleRegister = async () => {
    if (!user) {
      error('Please sign in to register for events');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register for event');

      triggerPointsCelebration();
      success('Ticket Confirmed!', `You are registered for ${event.title}. Attend to claim +${event.points_value} points!`);
      await refreshUser();
      onActionComplete();
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel registration');

      success('Registration Cancelled', `You released your spot for ${event.title}`);
      await refreshUser();
      onActionComplete();
    } catch (err: any) {
      error(err.message || 'Failed to cancel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-navy-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              {event.club_name || 'Campus Event'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                event.status === 'upcoming'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {event.status}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">{event.title}</h2>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> +{event.points_value} Participation Points
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-slate-800">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-slate-400 block font-medium">Time</span>
                <span className="font-semibold text-slate-800">{event.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-800">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Event Overview</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Capacity and Registration Tracker */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Registration Capacity
              </span>
              <span className="font-bold text-slate-900">
                {event.registered_count} / {event.max_capacity} registered ({capacityPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercent >= 90 ? 'bg-rose-500' : capacityPercent >= 60 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            {isFull && !event.isRegistered && (
              <p className="text-[11px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Registration is currently at full capacity.
              </p>
            )}
          </div>

          {/* User registration status notice */}
          {event.hasAttended && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Verified Attendance</p>
                <p className="text-[11px] text-emerald-700">
                  Your attendance was verified! You were awarded +{event.points_value} participation points.
                </p>
              </div>
            </div>
          )}

          {event.isRegistered && !event.hasAttended && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-900">You are Registered</p>
                <p className="text-[11px] text-indigo-700">
                  Your spot is secured. Show up at {event.location} on {event.date} to get attendance marked and receive points!
                </p>
              </div>
            </div>
          )}

          {/* Registered attendees preview if available */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Registered Attendees ({event.attendees.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {event.attendees.slice(0, 12).map((att) => (
                  <div
                    key={att.id || att.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-700 border border-slate-200"
                  >
                    <img
                      src={att.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(att.name)}`}
                      alt={att.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="font-medium text-[11px]">{att.name}</span>
                  </div>
                ))}
                {event.attendees.length > 12 && (
                  <span className="px-2 py-1 text-[11px] text-slate-500 font-medium">
                    +{event.attendees.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {/* Coordinator or Admin shortcut to Attendance */}
          {(role === 'coordinator' || role === 'admin') && onOpenAttendance ? (
            <button
              onClick={() => {
                onClose();
                onOpenAttendance(event.id);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              Take Attendance →
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              {event.isRegistered ? 'Spot secured' : `Earn +${event.points_value} pts`}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Close
            </button>

            {event.status === 'upcoming' && role !== 'admin' && (
              <>
                {event.isRegistered ? (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Cancel Registration'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isSubmitting || isFull}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Register Now
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
