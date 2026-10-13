import React, { useState } from 'react';
import { Club } from '../types';
import { apiService } from '../services/api';
import { DynamicIcon } from './DynamicIcon';
import { MapPin, Calendar, Users, X, Check, Loader2, Sparkles, UserCheck, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerPointsCelebration } from '../utils/confetti';

interface ClubDetailModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
  onViewEvent?: (eventId: string) => void;
  onEditClub?: (club: Club) => void;
}

export const ClubDetailModal: React.FC<ClubDetailModalProps> = ({
  club,
  isOpen,
  onClose,
  onActionComplete,
  onViewEvent,
  onEditClub,
}) => {
  const { user, role, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !club) return null;

  const handleJoin = async () => {
    if (!user) {
      error('Please sign in to join clubs');
      return;
    }
    setIsJoining(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join club');

      triggerPointsCelebration();
      success(`Welcome to ${club.name}!`, 'You earned participation points for joining.', data.pointsAwarded || 25);
      await refreshUser();
      onActionComplete();
    } catch (err: any) {
      error(err.message || 'Error joining club');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setIsLeaving(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to leave club');

      success('Club Left', `You have left ${club.name}`);
      await refreshUser();
      onActionComplete();
    } catch (err: any) {
      error(err.message || 'Error leaving club');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${club.name}" and all associated events?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await apiService.deleteClub(club.id);
      success('Club Deleted', res.message);
      await refreshUser();
      onClose();
      onActionComplete();
    } catch (err: any) {
      error(err.message || 'Failed to delete club');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Banner header */}
        <div className={`p-6 bg-gradient-to-r ${club.banner_gradient || 'from-navy-800 to-indigo-900'} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shrink-0">
              <DynamicIcon name={club.logo_icon} className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-2">
                {club.category}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">{club.name}</h2>
              <p className="text-white/80 text-xs mt-1 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>{club.member_count} Active Members</span>
                {club.coordinator_name && (
                  <>
                    <span>•</span>
                    <span>Lead: {club.coordinator_name}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* About */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the Club</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{club.description}</p>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Meeting Schedule</span>
                <span className="font-semibold text-slate-800">{club.meeting_schedule}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Location</span>
                <span className="font-semibold text-slate-800">{club.location}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Activities / Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Club Activities & Events</h3>
              <span className="text-xs text-indigo-600 font-medium">
                {club.events ? `${club.events.length} listed` : 'None'}
              </span>
            </div>

            {club.events && club.events.length > 0 ? (
              <div className="space-y-2.5">
                {club.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm bg-white flex items-center justify-between gap-3 transition-all cursor-pointer"
                    onClick={() => {
                      if (onViewEvent) {
                        onClose();
                        onViewEvent(evt.id);
                      }
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          evt.status === 'upcoming' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {evt.status}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{evt.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{evt.date} • {evt.time}</span>
                        <span>•</span>
                        <span>{evt.location}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <Sparkles className="w-3 h-3" /> +{evt.points_value} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center">
                No events currently scheduled. Check back soon!
              </p>
            )}
          </div>

          {/* Members list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Club Members</h3>
              <span className="text-xs font-semibold text-slate-500">{club.members?.length || club.member_count} members</span>
            </div>

            {club.members && club.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {club.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{member.department || 'Student'}</p>
                    </div>
                    {member.club_role === 'coordinator' && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">
                        Lead
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Be the first student to join this club!</p>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {role === 'admin' ? (
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <Shield className="w-4 h-4 text-indigo-600" /> Admin Controller Mode
              </span>
            ) : club.isMember ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <UserCheck className="w-4 h-4" /> You are an active club member
              </span>
            ) : (
              <span>Earn +25 participation points upon joining</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <>
                {onEditClub && (
                  <button
                    onClick={() => {
                      onClose();
                      onEditClub(club);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all"
                  >
                    Edit / Rename
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete Club
                </button>
              </>
            )}

            {role !== 'admin' && (
              club.isMember ? (
                <button
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all disabled:opacity-50"
                >
                  {isLeaving ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Leave Club'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Join Club
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
