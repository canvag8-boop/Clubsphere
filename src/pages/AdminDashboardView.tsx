import React, { useState, useEffect } from 'react';
import { AdminDashboardData, User, Club } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DynamicIcon } from '../components/DynamicIcon';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import {
  Shield,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  RotateCcw,
  Loader2,
  TrendingUp,
  UserCheck,
  Building,
  Trash2,
  Edit3,
  GraduationCap,
  KeyRound,
} from 'lucide-react';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

interface AdminDashboardViewProps {
  onOpenCreateClub: () => void;
  onOpenCreateEvent: () => void;
  onViewClub: (clubId: string) => void;
  onEditClub?: (club: Club) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onOpenCreateClub,
  onOpenCreateEvent,
  onViewClub,
  onEditClub,
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
  const [userYearFilter, setUserYearFilter] = useState<'all' | '1' | '2'>('all');
  const [userSectionFilter, setUserSectionFilter] = useState<'all' | 'A' | 'B'>('all');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dash, usersRes] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAllUsers(),
      ]);
      setData(dash);
      setAllUsers(usersRes.users);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await apiService.updateUserRole(userId, newRole);
      success('User Role Updated', `Role changed to ${newRole}`);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Are you sure you want to reset all database data to the original demo records?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await apiService.resetDemoData();
      success('Database Reset', res.message);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteClub = async (e: React.MouseEvent, clubId: string, clubName: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete "${clubName}" and all its records?`)) {
      return;
    }
    setDeletingClubId(clubId);
    try {
      const res = await apiService.deleteClub(clubId);
      success('Club Deleted', res.message);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to delete club');
    } finally {
      setDeletingClubId(null);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading university administrative portal...</p>
      </div>
    );
  }

  const { stats, clubs, systemActivities } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Banner & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-navy-950 to-indigo-950 text-white rounded-2xl shadow-xl border border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-indigo-500/30 text-indigo-300">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Campus Operations</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">University Administration Console</h1>
          <p className="text-xs text-slate-300 mt-1">
            Supervise collegiate clubs, approve events, oversee attendance, and manage student permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateClub}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Club
          </button>
          <button
            onClick={onOpenCreateEvent}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule Event
          </button>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            title="Change administrator password securely"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" /> Change Password
          </button>
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/15 flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Reset database to default seed records"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} /> Reset Demo
          </button>
        </div>
      </div>

      {/* 5 University Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Clubs */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clubs</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalClubs}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Active collegiate clubs</p>
          </div>
        </div>

        {/* Total Students */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalStudents}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.totalCoordinators} coordinators</p>
          </div>
        </div>

        {/* Total Events */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalEvents}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Scheduled activities</p>
          </div>
        </div>

        {/* Total Attendances Verified */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendances</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalAttendances}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified check-ins</p>
          </div>
        </div>

        {/* Total Points Distributed */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points Pool</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalPointsDistributed}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Total awarded to students</p>
          </div>
        </div>
      </div>

      {/* Main Grid: User Management & Club Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User & Coordinator Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Students & Club Coordinators Management
                </h3>
                <p className="text-xs text-slate-500">
                  Assign Coordinator privileges or promote to campus administrators
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {allUsers.length} Total Users
              </span>
            </div>

            {/* Classification Filter Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-600 uppercase">Class Filter:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => { setUserYearFilter('all'); setUserSectionFilter('all'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    userYearFilter === 'all' && userSectionFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setUserYearFilter('1'); setUserSectionFilter('A'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    userYearFilter === '1' && userSectionFilter === 'A'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
                  }`}
                >
                  1st Yr - Sec A
                </button>
                <button
                  onClick={() => { setUserYearFilter('1'); setUserSectionFilter('B'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    userYearFilter === '1' && userSectionFilter === 'B'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  1st Yr - Sec B
                </button>
                <button
                  onClick={() => { setUserYearFilter('2'); setUserSectionFilter('A'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    userYearFilter === '2' && userSectionFilter === 'A'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  2nd Yr - Sec A
                </button>
                <button
                  onClick={() => { setUserYearFilter('2'); setUserSectionFilter('B'); }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    userYearFilter === '2' && userSectionFilter === 'B'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  2nd Yr - Sec B
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Classification</th>
                    <th className="px-5 py-3.5">Student/Staff ID & Dept</th>
                    <th className="px-5 py-3.5">Points</th>
                    <th className="px-5 py-3.5 text-right">Role Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers
                    .filter((u) => {
                      if (userYearFilter === 'all' && userSectionFilter === 'all') return true;
                      if (u.role !== 'student') return false;
                      const yMatch = userYearFilter === 'all' || (u.year ? String(u.year) === userYearFilter : userYearFilter === '1');
                      const sMatch = userSectionFilter === 'all' || (u.section ? u.section === userSectionFilter : userSectionFilter === 'A');
                      return yMatch && sMatch;
                    })
                    .map((u) => {
                      const isUpdating = updatingUserId === u.id;
                      const year = u.year || 1;
                      const section = u.section || 'A';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <AnimatedAvatar
                                src={u.avatar}
                                alt={u.name}
                                gender={u.gender}
                                size="sm"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{u.name}</p>
                                  {u.gender && (
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                        u.gender === 'male'
                                          ? 'bg-blue-50 text-blue-700'
                                          : u.gender === 'female'
                                          ? 'bg-pink-50 text-pink-700'
                                          : 'bg-emerald-50 text-emerald-700'
                                      }`}
                                      title={`Gender: ${u.gender}`}
                                    >
                                      {u.gender === 'male' ? '♂' : u.gender === 'female' ? '♀' : '✦'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="px-5 py-3.5 text-xs">
                            {u.role === 'student' ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  year === 1
                                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                }`}>
                                  <GraduationCap className="w-2.5 h-2.5" /> {year === 1 ? '1st Year' : '2nd Year'}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                  section === 'A'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  Sec {section}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Staff</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800 block">{u.student_id || 'Staff'}</span>
                            <span className="text-slate-500">{u.department || 'General'}</span>
                          </td>

                          <td className="px-5 py-3.5 text-xs">
                            {u.role === 'admin' ? (
                              <span className="text-[11px] font-semibold text-slate-400 italic">Controller</span>
                            ) : (
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {u.points} pts
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    u.role === 'admin'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : u.role === 'coordinator'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  <option value="student">Student</option>
                                  <option value="coordinator">Club Coordinator</option>
                                  <option value="admin">Administrator</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clubs Directory Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Campus Clubs Status</h3>
                <p className="text-xs text-slate-500">Live roster count and scheduled activities</p>
              </div>
              <button
                onClick={onOpenCreateClub}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                + Register New Club
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => onViewClub(club.id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm bg-slate-50/50 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                      <DynamicIcon name={club.logo_icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                        {club.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Lead: {club.coordinator_name || 'Faculty Assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-slate-800 block">{club.actual_members} members</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">{club.total_events} events</span>
                    </div>

                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                      {onEditClub && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClub(club as any);
                          }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-colors"
                          title="Edit Club"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteClub(e, club.id, club.name)}
                        disabled={deletingClubId === club.id}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition-colors disabled:opacity-50"
                        title="Delete Club"
                      >
                        {deletingClubId === club.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Log */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Campus Activity Stream
                </h3>
                <p className="text-xs text-slate-500">Live platform events</p>
              </div>
            </div>

            <div className="space-y-3">
              {systemActivities.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 truncate">{act.title}</span>
                    {act.points_earned > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        +{act.points_earned} pts
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{act.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{act.user_name || 'Campus Student'}</span>
                    <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
