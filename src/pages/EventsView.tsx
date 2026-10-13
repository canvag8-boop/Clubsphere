import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerPointsCelebration } from '../utils/confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Plus,
  Loader2,
  ClipboardCheck,
  Shield,
} from 'lucide-react';

interface EventsViewProps {
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent?: () => void;
  onOpenAttendance?: (eventId: string) => void;
  onEditEvent?: (event: Event) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  onSelectEvent,
  onOpenCreateEvent,
  onOpenAttendance,
  onEditEvent,
}) => {
  const { user, role, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'my-events'>('all');
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getEvents(user?.id);
      setEvents(res.events);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleRegister = async (e: React.MouseEvent, evt: Event) => {
    e.stopPropagation();
    if (!user) {
      error('Please sign in to register for events');
      return;
    }

    if (role === 'admin') {
      error('Administrators manage events and cannot register as participants.');
      return;
    }

    setRegisteringId(evt.id);
    try {
      await apiService.registerForEvent(evt.id, user.id);
      triggerPointsCelebration();
      success('Ticket Confirmed!', `You are registered for ${evt.title}. Attend to claim +${evt.points_value} points!`);
      await refreshUser();
      await fetchEvents();
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.club_name && evt.club_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'upcoming') return evt.status === 'upcoming';
    if (activeTab === 'completed') return evt.status === 'completed';
    if (activeTab === 'my-events') return evt.isRegistered || evt.hasAttended;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Campus Events & Activities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse hackathons, athletic showdowns, guest speaker keynotes, and student jams.
          </p>
        </div>

        {(role === 'coordinator' || role === 'admin') && onOpenCreateEvent && (
          <button
            onClick={onOpenCreateEvent}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Schedule New Event
          </button>
        )}
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({events.filter((e) => e.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({events.filter((e) => e.status === 'completed').length})
          </button>
          {role !== 'admin' && (
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'my-events' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Registrations ({events.filter((e) => e.isRegistered || e.hasAttended).length})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, clubs, locations..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Events List / Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading events calendar...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistering = registeringId === evt.id;
            const capacityPercent = Math.min(100, Math.round((evt.registered_count / evt.max_capacity) * 100));

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt.id)}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {evt.club_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          evt.status === 'upcoming'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  {/* Logistics */}
                  <div className="p-5 pt-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-700">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    {/* Capacity meter */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5" /> Registrations
                        </span>
                        <span className="font-bold text-slate-700">
                          {evt.registered_count} / {evt.max_capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            capacityPercent >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Registration action */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-500" /> +{evt.points_value} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Admin edit button */}
                    {role === 'admin' && onEditEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(evt);
                        }}
                        className="p-1.5 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        title="Edit / Rename Event"
                      >
                        Edit
                      </button>
                    )}

                    {/* Coordinator take attendance button */}
                    {(role === 'coordinator' || role === 'admin') && onOpenAttendance && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAttendance(evt.id);
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Take Attendance"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </button>
                    )}

                    {role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" /> Event Manager
                      </span>
                    ) : evt.hasAttended ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Attended
                      </span>
                    ) : evt.isRegistered ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : evt.status === 'upcoming' ? (
                      <button
                        onClick={(e) => handleRegister(e, evt)}
                        disabled={isRegistering || evt.isFull}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegistering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : evt.isFull ? (
                          'Full'
                        ) : (
                          'Register'
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Concluded</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try checking another tab or clear your search query to see other college events.
          </p>
        </div>
      )}
    </div>
  );
};
