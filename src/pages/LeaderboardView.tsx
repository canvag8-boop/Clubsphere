import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DynamicIcon } from '../components/DynamicIcon';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Loader2,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Percent,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'points' | 'attendance'>('points');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<'all' | '1' | '2'>('all');
  const [filterSection, setFilterSection] = useState<'all' | 'A' | 'B'>('all');

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const yearParam = filterYear === 'all' ? undefined : (parseInt(filterYear) as 1 | 2);
      const secParam = filterSection === 'all' ? undefined : filterSection;
      const res = await apiService.getLeaderboard(yearParam, secParam, leaderboardType);
      setLeaderboard(res.leaderboard);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user, filterYear, filterSection, leaderboardType]);

  const filteredEntries = leaderboard.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.student_id && e.student_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">University Leaderboards</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Season 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Celebrating campus participation, active club engagement, and verified attendance rankings.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or department..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Leaderboard Dual Switcher Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tab 1: Activity Points Leaderboard */}
        <button
          type="button"
          onClick={() => setLeaderboardType('points')}
          className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden flex items-start gap-4 ${
            leaderboardType === 'points'
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-amber-400 shadow-md ring-2 ring-amber-400/30'
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm opacity-80 hover:opacity-100'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              leaderboardType === 'points'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">Activity Points Leaderboard</span>
              {leaderboardType === 'points' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <strong className="text-amber-700">1 Participation = 5 Points</strong>. The more club activities you participate in, the more points you earn!
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                <Sparkles className="w-3 h-3 text-amber-600" /> Rank = Participations × 5 pts
              </span>
            </div>
          </div>
        </button>

        {/* Tab 2: Attendance Positions Leaderboard */}
        <button
          type="button"
          onClick={() => setLeaderboardType('attendance')}
          className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden flex items-start gap-4 ${
            leaderboardType === 'attendance'
              ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm opacity-80 hover:opacity-100'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              leaderboardType === 'attendance'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">Attendance Positions Leaderboard</span>
              {leaderboardType === 'attendance' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Positions ranked according to total verified club attendances and attendance reliability rate.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Positions Ranked by Attendance Count
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Informational Rule Callout Banner */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
          leaderboardType === 'points'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {leaderboardType === 'points' ? (
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>
            {leaderboardType === 'points' ? (
              <>
                <strong>Participation Rule:</strong> Every verified club activity grants <strong>5 points</strong>. Total Points = <em>Attended Sessions × 5</em>.
              </>
            ) : (
              <>
                <strong>Attendance Ranking:</strong> Students ranked by number of events attended in campus clubs with attendance rate percentages.
              </>
            )}
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white border border-current shadow-xs">
          {leaderboardType === 'points' ? 'Points Formula Active' : 'Attendance Sorting Active'}
        </span>
      </div>

      {/* Classification Filter Bar */}
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
              All Campus
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">Year:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterYear('all')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterYear === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                All Years
              </button>
              <button
                onClick={() => setFilterYear('1')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterYear === '1' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                1st Year
              </button>
              <button
                onClick={() => setFilterYear('2')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterYear === '2' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                2nd Year
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-16">Section:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterSection('all')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                All Sec
              </button>
              <button
                onClick={() => setFilterSection('A')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'A' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Section A
              </button>
              <button
                onClick={() => setFilterSection('B')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  filterSection === 'B' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Section B
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Dynamic for Points or Attendance) */}
      {!isLoading && top3.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* #2 Silver */}
          <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-300" />
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-extrabold text-sm flex items-center justify-center mb-3 border border-slate-200">
              #2
            </div>
            <div className="relative">
              <AnimatedAvatar
                src={top3[1].avatar}
                alt={top3[1].name}
                gender={top3[1].gender}
                size="lg"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-slate-200 rounded-full text-slate-700">
                <Medal className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">{top3[1].name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Year {top3[1].year || 1} • Sec {top3[1].section || 'A'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{top3[1].department || 'Student'}</p>

            {/* Metric pill */}
            {leaderboardType === 'points' ? (
              <div className="mt-3 px-3 py-1 bg-amber-50 rounded-xl text-xs font-extrabold text-amber-800 border border-amber-200">
                {top3[1].points} Points ({top3[1].attended_count} × 5 pts)
              </div>
            ) : (
              <div className="mt-3 px-3 py-1 bg-emerald-50 rounded-xl text-xs font-extrabold text-emerald-800 border border-emerald-200">
                {top3[1].attended_count} Attended • {top3[1].attendance_rate ?? 0}% Rate
              </div>
            )}

            {top3[1].badges && top3[1].badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {top3[1].badges.slice(0, 2).map((b) => (
                  <span
                    key={b.badge_name}
                    className="text-[10px] font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600"
                  >
                    {b.badge_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* #1 Gold - Champion */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-2xl border-2 border-amber-300 p-6 flex flex-col items-center text-center shadow-lg relative transform md:-translate-y-2">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
            <div className="w-9 h-9 rounded-full bg-amber-400 text-white font-extrabold text-sm flex items-center justify-center mb-2 shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div className="relative">
              <AnimatedAvatar
                src={top3[0].avatar}
                alt={top3[0].name}
                gender={top3[0].gender}
                size="xl"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-white rounded-full shadow-sm">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full mt-2">
              {leaderboardType === 'points' ? 'Points Champion' : 'Attendance Leader #1'}
            </span>
            <h3 className="font-extrabold text-slate-900 mt-1 text-lg">{top3[0].name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Year {top3[0].year || 1} • Sec {top3[0].section || 'A'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{top3[0].department}</p>

            {/* Metric pill */}
            {leaderboardType === 'points' ? (
              <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-sm font-extrabold shadow-sm">
                {top3[0].points} Points ({top3[0].attended_count} × 5 pts)
              </div>
            ) : (
              <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-extrabold shadow-sm">
                {top3[0].attended_count} Attended • {top3[0].attendance_rate ?? 0}% Rate
              </div>
            )}

            {top3[0].badges && top3[0].badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {top3[0].badges.slice(0, 3).map((b) => (
                  <span
                    key={b.badge_name}
                    className="text-[10px] font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-amber-800"
                  >
                    ★ {b.badge_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* #3 Bronze */}
          <div className="order-3 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-600" />
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center mb-3 border border-amber-200">
              #3
            </div>
            <div className="relative">
              <AnimatedAvatar
                src={top3[2].avatar}
                alt={top3[2].name}
                gender={top3[2].gender}
                size="lg"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-600 text-white rounded-full">
                <Medal className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">{top3[2].name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Year {top3[2].year || 1} • Sec {top3[2].section || 'A'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{top3[2].department || 'Student'}</p>

            {/* Metric pill */}
            {leaderboardType === 'points' ? (
              <div className="mt-3 px-3 py-1 bg-amber-50 rounded-xl text-xs font-extrabold text-amber-800 border border-amber-200">
                {top3[2].points} Points ({top3[2].attended_count} × 5 pts)
              </div>
            ) : (
              <div className="mt-3 px-3 py-1 bg-emerald-50 rounded-xl text-xs font-extrabold text-emerald-800 border border-emerald-200">
                {top3[2].attended_count} Attended • {top3[2].attendance_rate ?? 0}% Rate
              </div>
            )}

            {top3[2].badges && top3[2].badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {top3[2].badges.slice(0, 2).map((b) => (
                  <span
                    key={b.badge_name}
                    className="text-[10px] font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600"
                  >
                    {b.badge_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {leaderboardType === 'points' ? (
              <>
                <Trophy className="w-4 h-4 text-amber-500" /> Activity Points Rankings (5 pts per activity)
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4 text-emerald-600" /> Attendance Positions Leaderboard
              </>
            )}
          </h3>
          <span className="text-xs font-bold text-slate-500">{filteredEntries.length} Students Listed</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Calculating rankings...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-center w-20">
                    {leaderboardType === 'points' ? 'Rank' : 'Position'}
                  </th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Classification</th>
                  {leaderboardType === 'points' ? (
                    <>
                      <th className="px-5 py-3.5">Participations</th>
                      <th className="px-5 py-3.5">Clubs & Badges</th>
                      <th className="px-5 py-3.5 text-right">Activity Points</th>
                    </>
                  ) : (
                    <>
                      <th className="px-5 py-3.5">Verified Attendance</th>
                      <th className="px-5 py-3.5">Attendance Reliability</th>
                      <th className="px-5 py-3.5 text-right">Points Earned</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((student) => {
                  const isCurrentUser = user?.id === student.id;
                  const year = student.year || 1;
                  const section = student.section || 'A';
                  const currentRank = leaderboardType === 'points' ? student.rank : (student.attendance_rank || student.rank);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCurrentUser ? 'bg-indigo-50/50 font-semibold' : ''
                      }`}
                    >
                      {/* Rank / Position badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold ${
                            currentRank === 1
                              ? 'bg-amber-400 text-white shadow-sm ring-2 ring-amber-300/40'
                              : currentRank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : currentRank === 3
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {currentRank}
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <AnimatedAvatar
                            src={student.avatar}
                            alt={student.name}
                            gender={student.gender}
                            size="sm"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                  You
                                </span>
                              )}
                              {student.gender && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    student.gender === 'male'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : student.gender === 'female'
                                      ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                  title={`Gender: ${student.gender}`}
                                >
                                  {student.gender === 'male' ? '♂' : student.gender === 'female' ? '♀' : '✦'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {student.student_id || 'ID N/A'} • {student.department || 'Undergraduate'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="px-5 py-3.5 text-xs">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              year === 1
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            <GraduationCap className="w-3 h-3" /> {year === 1 ? '1st Year' : '2nd Year'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              section === 'A'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            Section {section}
                          </span>
                        </div>
                      </td>

                      {/* Dynamic Columns based on Leaderboard Type */}
                      {leaderboardType === 'points' ? (
                        <>
                          {/* Participations count */}
                          <td className="px-5 py-3.5 text-xs">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {student.attended_count} Activities
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {student.attended_count} × 5 pts = {student.points} pts
                              </span>
                            </div>
                          </td>

                          {/* Clubs and Badges */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                <Users className="w-3 h-3" /> {student.clubs_count} clubs
                              </span>
                              {student.badges && student.badges.slice(0, 2).map((b) => (
                                <span
                                  key={b.badge_name}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                                  title={b.description}
                                >
                                  <DynamicIcon name={b.badge_icon} className="w-3 h-3 text-amber-500" />
                                  {b.badge_name}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Points */}
                          <td className="px-5 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {student.points} pts
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Attendance Count */}
                          <td className="px-5 py-3.5 text-xs">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                                {student.attended_count} Attended
                              </span>
                              <span className="text-[11px] text-slate-500 mt-0.5">
                                of {student.total_registered || student.attended_count} registered sessions
                              </span>
                            </div>
                          </td>

                          {/* Attendance Reliability Bar */}
                          <td className="px-5 py-3.5">
                            <div className="w-40 space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-700">{student.attendance_rate ?? 0}% Rate</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                                    (student.attendance_rate ?? 0) >= 80
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : (student.attendance_rate ?? 0) >= 50
                                      ? 'text-amber-700 bg-amber-50'
                                      : 'text-slate-600 bg-slate-100'
                                  }`}
                                >
                                  {(student.attendance_rate ?? 0) >= 80
                                    ? '★ Top'
                                    : (student.attendance_rate ?? 0) >= 50
                                    ? 'Good'
                                    : 'Regular'}
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    (student.attendance_rate ?? 0) >= 80
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                      : (student.attendance_rate ?? 0) >= 50
                                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${Math.min(100, student.attendance_rate ?? 0)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Points Earned from Attendance */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {student.points} pts
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {student.attended_count} × 5 pts
                              </span>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No students match your filter or search</h4>
          </div>
        )}
      </div>
    </div>
  );
};
