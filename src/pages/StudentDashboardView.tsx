import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { StudentDashboardData, Club } from '../types';
import { DynamicIcon } from '../components/DynamicIcon';
import {
  Sparkles,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Trophy,
  Loader2,
  Activity as ActivityIcon,
  PlusCircle,
  GraduationCap,
  Shield,
} from 'lucide-react';

interface StudentDashboardViewProps {
  onExploreClubs: () => void;
  onExploreEvents: () => void;
  onViewEvent: (eventId: string) => void;
  onViewClub: (clubId: string) => void;
  onViewLeaderboard: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onExploreClubs,
  onExploreEvents,
  onViewEvent,
  onViewClub,
  onViewLeaderboard,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [dashData, clubsData] = await Promise.all([
        apiService.getStudentDashboard(user.id),
        apiService.getClubs(user.id),
      ]);
      setData(dashData);
      setClubs(clubsData.clubs);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading your student dashboard...</p>
      </div>
    );
  }

  const { stats, upcomingEvents, recentActivities, achievements, recommendedEvents } = data;
  const joinedClubs = clubs.filter((c) => c.isMember);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-navy-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {user?.role.toUpperCase()} PORTAL
              </span>
              {user?.role === 'student' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {user.year === 1 ? '1st Year' : '2nd Year'} • Section {user.section || 'A'}
                </span>
              )}
              {user?.gender && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 capitalize">
                  {user.gender === 'male' ? '♂ Male' : user.gender === 'female' ? '♀ Female' : '✦ Other'}
                </span>
              )}
              <span className="text-xs text-slate-300">{user?.department || 'Undergraduate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your campus activities, join faculty-supervised student clubs, earn participation points, and reach the top of the leaderboard.
            </p>
          </div>

          {/* Points summary card inside Hero - hidden for admin */}
          {user?.role !== 'admin' ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shadow-inner flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-300 block">Activity Points (5 pts/act)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{stats.participationPoints}</span>
                  <span className="text-xs font-bold text-amber-400">PTS</span>
                </div>
                <span className="text-[10px] text-amber-200/90 block font-medium">{stats.eventsAttended} activities × 5 pts</span>
                <button
                  onClick={onViewLeaderboard}
                  className="text-[11px] font-semibold text-indigo-200 hover:text-white flex items-center gap-1 mt-0.5"
                >
                  View Leaderboard <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shadow-inner flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-300 block">System Authority</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-white tracking-tight">App Controller</span>
                </div>
                <span className="text-[10px] text-indigo-200/90 block font-medium">Points apply strictly to students</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Feature 1 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Clubs Joined */}
        <div
          onClick={onExploreClubs}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clubs Joined</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.clubsJoined}</span>
            <span className="text-xs text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active collegiate memberships</p>
        </div>

        {/* Card 2: Upcoming Events */}
        <div
          onClick={onExploreEvents}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Events</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.upcomingEventsCount}</span>
            <span className="text-xs text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
              Registered <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Confirmed event registrations</p>
        </div>

        {/* Card 3: Events Attended */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Attended</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.eventsAttended}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Attendance officially confirmed</p>
        </div>

        {/* Card 4: Participation Points (Replaced for Admin) */}
        {user?.role !== 'admin' ? (
          <div
            onClick={onViewLeaderboard}
            className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participation Points</span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.participationPoints}</span>
              <span className="text-xs text-amber-600 font-semibold group-hover:underline flex items-center gap-1">
                Leaderboard <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Points available for honours</p>
          </div>
        ) : (
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-card transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-slate-900">Controller</span>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Unrestricted
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Full administration authority</p>
          </div>
        )}
      </div>

      {/* Main Grid: Upcoming Events & My Clubs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Events Registered & Recommended */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Registered Events */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Upcoming Events</h2>
                <p className="text-xs text-slate-500">Events you have registered to attend</p>
              </div>
              <button
                onClick={onExploreEvents}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Find more events <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onViewEvent(evt.id)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md bg-gradient-to-r from-white to-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <DynamicIcon name={evt.club_icon || 'Calendar'} className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-indigo-600">{evt.club_name}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Registered
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-0.5">
                          {evt.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {evt.date} • {evt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {evt.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Sparkles className="w-3 h-3 text-amber-500" /> +{evt.points_value} pts
                      </span>
                      <span className="text-[11px] text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform mt-2 hidden sm:block">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-700">No upcoming events registered</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Register for hackathons, sports clashes, or acoustic jams to start collecting attendance points.
                </p>
                <button
                  onClick={onExploreEvents}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Explore Events Calendar
                </button>
              </div>
            )}
          </div>

          {/* Recommended Upcoming Events */}
          {recommendedEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recommended for You</h3>
                  <p className="text-xs text-slate-500">Popular upcoming campus events you haven't joined yet</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onViewEvent(evt.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm bg-slate-50/50 flex flex-col justify-between transition-all cursor-pointer group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                        {evt.club_name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {evt.date}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-600">+{evt.points_value} pts</span>
                      <span className="text-[11px] font-bold text-indigo-600">Register →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4 text-indigo-600" /> Recent Activities
                </h3>
                <p className="text-xs text-slate-500">Live ledger of your actions, events, and point rewards</p>
              </div>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mt-0.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-800">{act.title}</h5>
                        {act.points_earned > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            +{act.points_earned} pts
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(act.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Joined Clubs & Achievements */}
        <div className="space-y-6">
          {/* My Joined Clubs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Clubs</h3>
                <p className="text-xs text-slate-500">{joinedClubs.length} active memberships</p>
              </div>
              <button
                onClick={onExploreClubs}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Join More <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {joinedClubs.length > 0 ? (
              <div className="space-y-3">
                {joinedClubs.map((club) => (
                  <div
                    key={club.id}
                    onClick={() => onViewClub(club.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm bg-white flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <DynamicIcon name={club.logo_icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                          {club.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{club.category}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-700">You haven't joined any clubs yet</p>
                <button
                  onClick={onExploreClubs}
                  className="mt-3 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Discover Clubs
                </button>
              </div>
            )}
          </div>

          {/* Student Badges and Achievements */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Student Badges
                </h3>
                <p className="text-xs text-slate-500">{achievements.length} badges unlocked</p>
              </div>
            </div>

            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-500/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <DynamicIcon name={ach.badge_icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{ach.badge_name}</h4>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Unlocked
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                Participate in clubs and attend campus events to unlock badges!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
