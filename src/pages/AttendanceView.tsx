import React, { useState, useEffect } from 'react';
import { Event, Attendee, StudentYear, StudentSection } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerPointsCelebration } from '../utils/confetti';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  Users,
  Loader2,
  Clock,
  MapPin,
  ShieldAlert,
  GraduationCap,
  Filter,
} from 'lucide-react';

interface AttendanceViewProps {
  initialEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ initialEventId }) => {
  const { user, role, refreshUser } = useAuth();
  const { success, error } = useToast();
  const isAdmin = role === 'admin' || role === 'coordinator';

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || '');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [markingUserId, setMarkingUserId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<'all' | '1' | '2'>('all');
  const [filterSection, setFilterSection] = useState<'all' | 'A' | 'B'>('all');

  // Fetch all events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const res = await apiService.getEvents();
        setEvents(res.events);

        if (initialEventId) {
          setSelectedEventId(initialEventId);
        } else if (res.events.length > 0 && !selectedEventId) {
          // Default to the first upcoming event or first event
          const firstUpcoming = res.events.find((e) => e.status === 'upcoming') || res.events[0];
          setSelectedEventId(firstUpcoming.id);
        }
      } catch (err) {
        console.error('Failed to load events for attendance:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();
  }, [initialEventId]);

  // Load roster when selectedEventId changes
  const loadRoster = async (eventId: string) => {
    if (!eventId) return;
    try {
      setIsLoadingRoster(true);
      const res = await apiService.getEventAttendance(eventId);
      setCurrentEvent(res.event);
      setAttendees(res.attendees);
    } catch (err) {
      console.error('Failed to load attendance roster:', err);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadRoster(selectedEventId);
    }
  }, [selectedEventId]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!user || !selectedEventId) return;

    setMarkingUserId(studentId);
    try {
      const res = await apiService.markAttendance(selectedEventId, studentId, status, user.id);

      if (status === 'present') {
        triggerPointsCelebration();
        success(res.message, `Awarded +${res.pointsAwarded} points to student.`, res.pointsAwarded);
      } else {
        success(res.message);
      }

      await loadRoster(selectedEventId);
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to update attendance');
    } finally {
      setMarkingUserId(null);
    }
  };

  // Filter attendees by search, year, and section
  const filteredAttendees = attendees.filter((att) => {
    const matchesSearch =
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.student_id && att.student_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (att.department && att.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const attYearStr = att.year ? String(att.year) : '1';
    const attSectionStr = att.section || 'A';

    const matchesYear = filterYear === 'all' || attYearStr === filterYear;
    const matchesSection = filterSection === 'all' || attSectionStr === filterSection;

    return matchesSearch && matchesYear && matchesSection;
  });

  const presentCount = attendees.filter((a) => a.attendance_status === 'present').length;
  const absentCount = attendees.filter((a) => a.attendance_status === 'absent').length;
  const unmarkedCount = attendees.filter((a) => a.attendance_status === 'unmarked').length;
  const totalRegistered = attendees.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Tracking Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Coordinator Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Verify student check-ins, record attendance records, and automatically award verified participation points.
          </p>
        </div>

        {role === 'student' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <b>View-only mode.</b> Attendance is marked by your club coordinator or admin.
            </span>
          </div>
        )}
      </div>

      {/* Event Selector Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Select Active Event for Attendance
          </label>
          {isLoadingEvents ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.date} • {evt.club_name}) [{evt.status.toUpperCase()}]
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search registered student */}
        <div className="min-w-[260px] self-end w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter Roster
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name, ID..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Year & Section Classification Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Classification Filter:</span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { setFilterYear('all'); setFilterSection('all'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterYear === 'all' && filterSection === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Students ({attendees.length})
            </button>
            <button
              onClick={() => { setFilterYear('1'); setFilterSection('A'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterYear === '1' && filterSection === 'A'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              1st Year • Sec A
            </button>
            <button
              onClick={() => { setFilterYear('1'); setFilterSection('B'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterYear === '1' && filterSection === 'B'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              1st Year • Sec B
            </button>
            <button
              onClick={() => { setFilterYear('2'); setFilterSection('A'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterYear === '2' && filterSection === 'A'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              2nd Year • Sec A
            </button>
            <button
              onClick={() => { setFilterYear('2'); setFilterSection('B'); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterYear === '2' && filterSection === 'B'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              2nd Year • Sec B
            </button>
          </div>
        </div>

        {/* Detailed Year & Section selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">Year:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterYear('all')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterYear === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Years
              </button>
              <button
                onClick={() => setFilterYear('1')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterYear === '1' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1st Year
              </button>
              <button
                onClick={() => setFilterYear('2')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterYear === '2' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2nd Year
              </button>
            </div>
          </div>

          {/* Section selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">Section:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterSection('all')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Sec
              </button>
              <button
                onClick={() => setFilterSection('A')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'A' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Section A
              </button>
              <button
                onClick={() => setFilterSection('B')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'B' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Section B
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details & Live Attendance Stats Header */}
      {currentEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Event Brief */}
          <div className="lg:col-span-2 p-5 bg-gradient-to-r from-navy-900 to-indigo-900 text-white rounded-2xl shadow-sm border border-navy-800">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentEvent.date} • {currentEvent.time}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{currentEvent.title}</h3>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-300" /> {currentEvent.location}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Participation Reward: +5 pts (1 activity = 5 pts)
              </span>
            </div>
          </div>

          {/* Stats Box 1: Verified Present */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-600">{presentCount}</span>
              <span className="text-xs font-bold text-slate-500">of {totalRegistered} registered</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
            </div>
          </div>

          {/* Stats Box 2: Attendance Rate */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-indigo-600">{attendanceRate}%</span>
              <span className="text-xs font-semibold text-slate-500">
                {absentCount} Absent • {unmarkedCount} Unmarked
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Points credited immediately on mark</p>
          </div>
        </div>
      )}

      {/* Attendees Table / Roster */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" /> Registered Students Roster
            </h3>
            <p className="text-xs text-slate-500">
              Mark Present to credit +{currentEvent?.points_value || 50} points to the student's profile
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {filteredAttendees.length} Students Shown
          </span>
        </div>

        {isLoadingRoster ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Loading attendee roster...</p>
          </div>
        ) : filteredAttendees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Classification</th>
                  <th className="px-5 py-3.5">Student ID & Dept</th>
                  <th className="px-5 py-3.5">Points</th>
                  <th className="px-5 py-3.5">Attendance Status</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Verification Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.map((att) => {
                  const studentId = att.user_id || att.id || '';
                  const isMarking = markingUserId === studentId;
                  const year = att.year || 1;
                  const section = att.section || 'A';

                  return (
                    <tr key={studentId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student info with AnimatedAvatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <AnimatedAvatar
                            src={att.avatar}
                            alt={att.name}
                            gender={att.gender}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">{att.name}</p>
                              {att.gender && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    att.gender === 'male'
                                      ? 'bg-blue-50 text-blue-700'
                                      : att.gender === 'female'
                                      ? 'bg-pink-50 text-pink-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                  title={`Gender: ${att.gender}`}
                                >
                                  {att.gender === 'male' ? '♂' : att.gender === 'female' ? '♀' : '✦'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{att.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Academic Classification Badges */}
                      <td className="px-5 py-3.5 text-xs">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            year === 1
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          }`}>
                            <GraduationCap className="w-3 h-3" /> {year === 1 ? '1st Year' : '2nd Year'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            section === 'A'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            Section {section}
                          </span>
                        </div>
                      </td>

                      {/* ID & Dept */}
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 block">{att.student_id || 'ID Pending'}</span>
                        <span className="text-slate-500">{att.department || 'General Department'}</span>
                      </td>

                      {/* Current Points */}
                      <td className="px-5 py-3.5 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" /> {att.points} pts
                        </span>
                      </td>


                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {att.attendance_status === 'present' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present (+{att.points_awarded || currentEvent?.points_value} pts)
                          </span>
                        ) : att.attendance_status === 'absent' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Not Marked
                          </span>
                        )}
                      </td>

                      {/* Action buttons — Admin/Coordinator only */}
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleMarkAttendance(studentId, 'present')}
                              disabled={isMarking || att.attendance_status === 'present'}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                att.attendance_status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent'
                              } disabled:opacity-60`}
                            >
                              {isMarking ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleMarkAttendance(studentId, 'absent')}
                              disabled={isMarking || att.attendance_status === 'absent'}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                att.attendance_status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent'
                              } disabled:opacity-60`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No students registered yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Students can register for this event from the Events calendar. Once registered, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
