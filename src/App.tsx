import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { StudentDashboardView } from './pages/StudentDashboardView';
import { ClubsView } from './pages/ClubsView';
import { EventsView } from './pages/EventsView';
import { AttendanceView } from './pages/AttendanceView';
import { LeaderboardView } from './pages/LeaderboardView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { LoginPage } from './pages/LoginPage';
import { ClubDetailModal } from './components/ClubDetailModal';
import { EventDetailModal } from './components/EventDetailModal';
import { CreateClubModal } from './components/CreateClubModal';
import { EditClubModal } from './components/EditClubModal';
import { CreateEventModal } from './components/CreateEventModal';
import type { Club, Event } from './types';
import { apiService } from './services/api';
import { AnimatedAvatar } from './components/AnimatedAvatar';
import {
  LayoutDashboard,
  Compass,
  Calendar,
  ClipboardCheck,
  Trophy,
  Shield,
  Menu,
  X,
  Sparkles,
  LogOut,
  GraduationCap,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AppIntroAnimation } from './components/AppIntroAnimation';
import { HelpModal } from './components/HelpModal';

export function App() {
  const { user, role, logout, isLoading, refreshUser } = useAuth();

  // App opening animation on startup
  const [showIntro, setShowIntro] = useState(true);

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'clubs' | 'events' | 'attendance' | 'leaderboard' | 'admin'>(
    role === 'admin' ? 'admin' : 'dashboard'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Modals state
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState<Club | null>(null);
  const [isEditClubOpen, setIsEditClubOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [targetAttendanceEventId, setTargetAttendanceEventId] = useState<string | null>(null);

  const isAdmin = role === 'admin' || role === 'coordinator';

  const handleOpenEditClub = (club: Club) => {
    setSelectedClubForEdit(club);
    setIsEditClubOpen(true);
  };

  // If startup intro is active, present intro animation with isReady synchronization
  if (showIntro) {
    return (
      <AppIntroAnimation
        isReady={!isLoading}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  // Show login page if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-slate-400 text-sm font-medium">Loading ClubSphere…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onReplayIntro={() => setShowIntro(true)} />;
  }

  // Load clubs for event creation modal
  const loadClubsForModal = async () => {
    try {
      const res = await apiService.getClubs(user?.id);
      setAllClubs(res.clubs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenClub = async (clubId: string) => {
    try {
      const res = await apiService.getClubDetails(clubId, user?.id);
      setSelectedClub(res.club);
      setIsClubModalOpen(true);
    } catch (err) {
      console.error('Failed to open club details:', err);
    }
  };

  const handleOpenEvent = async (eventId: string) => {
    try {
      const res = await apiService.getEventDetails(eventId, user?.id);
      setSelectedEvent(res.event);
      setIsEventModalOpen(true);
    } catch (err) {
      console.error('Failed to open event details:', err);
    }
  };

  const handleOpenAttendanceForEvent = (eventId: string) => {
    setTargetAttendanceEventId(eventId);
    setCurrentTab('attendance');
  };

  const navItems = role === 'admin'
    ? [
        { id: 'admin', label: 'Admin Controller', icon: Shield, badge: 'Full Control' as string | undefined },
        { id: 'clubs', label: 'College Clubs', icon: Compass },
        { id: 'events', label: 'Events & Calendar', icon: Calendar },
        { id: 'attendance', label: 'Attendance Records', icon: ClipboardCheck },
        { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy },
        { id: 'dashboard', label: 'Student Portal View', icon: LayoutDashboard },
      ]
    : [
        { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
        { id: 'clubs', label: 'College Clubs', icon: Compass },
        { id: 'events', label: 'Events & Calendar', icon: Calendar },
        { id: 'attendance', label: 'Attendance Tracking', icon: ClipboardCheck },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        // Admin Console only for admin/coordinator
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: Shield, badge: 'Admin' as string | undefined }] : []),
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* ---------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION (Desktop) */}
      {/* ---------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-950 text-white border-r border-navy-900 shrink-0 sticky top-0 h-screen z-30 select-none">
        {/* App Logo & Branding */}
        <div className="p-6 border-b border-navy-900/80 flex items-center justify-between">
          <button
            onClick={() => setShowIntro(true)}
            type="button"
            title="Replay opening animation"
            className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-glow text-white group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block">ClubSphere</span>
              <span className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase block">
                Activities Tracker
              </span>
            </div>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-none">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Actions — Admin only */}
          {isAdmin && (
            <>
              <div className="pt-6 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    loadClubsForModal();
                    setIsCreateEventOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs text-indigo-300 hover:text-white hover:bg-navy-900 transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" /> + Schedule Event
                </button>
                <button
                  onClick={() => setIsCreateClubOpen(true)}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs text-indigo-300 hover:text-white hover:bg-navy-900 transition-colors flex items-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5" /> + Register Club
                </button>
              </div>
            </>
          )}

          {/* Help & Documentation */}
          <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Support
          </div>
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Help & Guide</span>
          </button>
        </nav>

        {/* User Profile + Logout in Sidebar */}
        <div className="p-4 border-t border-navy-900/80 bg-navy-950/70">
          {/* Role & Classification badge */}
          <div className="space-y-1 mb-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              isAdmin ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-blue-600/10 border border-blue-500/20'
            }`}>
              {isAdmin
                ? <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                : <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              <span className={`text-[11px] font-bold capitalize ${
                isAdmin ? 'text-indigo-300' : 'text-blue-300'
              }`}>
                {isAdmin ? (role === 'coordinator' ? 'Club Coordinator' : 'Administrator') : 'Student'}
              </span>
              {isAdmin && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">Full Access</span>
              )}
            </div>

            {/* Student Year & Section Tag */}
            {role === 'student' && (
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-navy-900/90 border border-indigo-500/20 text-[10px] font-bold text-cyan-300">
                <span className="flex items-center gap-1">
                  🎓 {user?.year === 1 ? '1st Year' : '2nd Year'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
                  Sec {user?.section || 'A'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-900/60 border border-navy-800">
            <AnimatedAvatar
              src={user?.avatar}
              alt={user?.name || 'User'}
              gender={user?.gender}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate block">{user?.name || 'User'}</span>
              {role === 'admin' ? (
                <span className="text-[10px] text-indigo-400 font-bold block">App Controller</span>
              ) : (
                <span className="text-[10px] text-amber-400 font-bold block">{user?.points || 0} pts</span>
              )}
            </div>
            {role === 'admin' && (
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                title="Change Password"
                className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-navy-800 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 font-medium">ClubSphere Portal</span>
              <h2 className="text-sm font-bold text-slate-800 capitalize">{currentTab.replace('-', ' ')}</h2>
            </div>
          </div>

          {/* Header right section */}
          <div className="flex items-center gap-2">
            {/* Student Classification Pill */}
            {role === 'student' && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-50 border border-cyan-200 text-cyan-800">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />
                <span>{user?.year === 1 ? '1st Year' : '2nd Year'} • Sec {user?.section || 'A'}</span>
              </div>
            )}

            {/* Role badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              isAdmin
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              {isAdmin
                ? <Shield className="w-3.5 h-3.5" />
                : <GraduationCap className="w-3.5 h-3.5" />}
              <span className="capitalize">{isAdmin ? (role === 'coordinator' ? 'Coordinator' : 'Admin') : 'Student'}</span>
            </div>

            {/* Points badge - removed for admin controller */}
            {role !== 'admin' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{user?.points || 0}</span>
                <span className="text-[10px] font-semibold text-amber-600">PTS</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>App Controller</span>
              </div>
            )}

            {/* Help & Guide button */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              title="Help & User Guide"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Help & Guide</span>
            </button>

            {/* User info + logout */}
            <div className="flex items-center gap-2 pl-1">
              <AnimatedAvatar
                src={user?.avatar}
                alt={user?.name || 'User'}
                gender={user?.gender}
                size="xs"
              />
              <span className="hidden sm:block text-xs font-bold text-slate-700">{user?.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-navy-950 text-white p-4 space-y-2 border-b border-navy-800 animate-slide-in">
            {/* Mobile user info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-900/60 border border-navy-800 mb-3">
              <AnimatedAvatar
                src={user?.avatar}
                alt={user?.name || 'User'}
                gender={user?.gender}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-indigo-300 capitalize font-semibold">
                  {role === 'student'
                    ? `${user?.year === 1 ? '1st Year' : '2nd Year'} Sec ${user?.section || 'A'} · ${user?.points} pts`
                    : role === 'admin'
                    ? 'App Controller'
                    : `${role} · ${user?.points} pts`}
                </div>
              </div>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-1 border-t border-navy-900">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Body Pages */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <StudentDashboardView
              onExploreClubs={() => setCurrentTab('clubs')}
              onExploreEvents={() => setCurrentTab('events')}
              onViewEvent={handleOpenEvent}
              onViewClub={handleOpenClub}
              onViewLeaderboard={() => setCurrentTab('leaderboard')}
            />
          )}

          {currentTab === 'clubs' && (
            <ClubsView
              onSelectClub={handleOpenClub}
              onOpenCreateClub={() => setIsCreateClubOpen(true)}
              onEditClub={handleOpenEditClub}
            />
          )}

          {currentTab === 'events' && (
            <EventsView
              onSelectEvent={handleOpenEvent}
              onOpenCreateEvent={() => {
                loadClubsForModal();
                setIsCreateEventOpen(true);
              }}
              onOpenAttendance={handleOpenAttendanceForEvent}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView initialEventId={targetAttendanceEventId} onSelectEvent={handleOpenEvent} />
          )}

          {currentTab === 'leaderboard' && <LeaderboardView />}

          {currentTab === 'admin' && isAdmin && (
            <AdminDashboardView
              onOpenCreateClub={() => setIsCreateClubOpen(true)}
              onOpenCreateEvent={() => {
                loadClubsForModal();
                setIsCreateEventOpen(true);
              }}
              onViewClub={handleOpenClub}
              onEditClub={handleOpenEditClub}
            />
          )}

          {currentTab === 'admin' && !isAdmin && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
              <Shield className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-600">Admin Access Required</p>
              <p className="text-sm mt-1">You do not have permission to view this page.</p>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}
      <ClubDetailModal
        club={selectedClub}
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        onActionComplete={async () => {
          if (selectedClub) {
            handleOpenClub(selectedClub.id);
          }
          await refreshUser();
        }}
        onViewEvent={handleOpenEvent}
        onEditClub={handleOpenEditClub}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onActionComplete={async () => {
          if (selectedEvent) {
            handleOpenEvent(selectedEvent.id);
          }
          await refreshUser();
        }}
        onOpenAttendance={handleOpenAttendanceForEvent}
      />

      {isAdmin && (
        <>
          <CreateClubModal
            isOpen={isCreateClubOpen}
            onClose={() => setIsCreateClubOpen(false)}
            onClubCreated={refreshUser}
          />
          <EditClubModal
            club={selectedClubForEdit}
            isOpen={isEditClubOpen}
            onClose={() => setIsEditClubOpen(false)}
            onUpdated={refreshUser}
          />
          <CreateEventModal
            clubs={allClubs}
            isOpen={isCreateEventOpen}
            onClose={() => setIsCreateEventOpen(false)}
            onEventCreated={refreshUser}
          />
        </>
      )}
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Help & Guide Documentation Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        userRole={role}
      />
    </div>
  );
}
