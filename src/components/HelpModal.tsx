import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Shield,
  GraduationCap,
  Users,
  Trophy,
  Calendar,
  Compass,
  CheckCircle2,
  KeyRound,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

type TabType = 'overview' | 'roles' | 'points' | 'clubs-events' | 'security' | 'faq';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white border-b border-navy-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                ClubSphere Help & Documentation
              </h2>
              <p className="text-xs text-indigo-200/80">
                Complete guide to roles, activities, attendance rules & security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-slate-50/80 overflow-x-auto scrollbar-none text-xs font-semibold text-slate-600 gap-1 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'roles'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>User Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'points'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Points & Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('clubs-events')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clubs-events'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Clubs & Events</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-2 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'faq'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">What is ClubSphere?</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  ClubSphere is a full-featured campus engagement platform designed for colleges and universities.
                  It bridges the gap between students, club coordinators, and administrators by centralizing club memberships,
                  event registrations, real-time attendance logging, and verifiable student merit points.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Discover & Join</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Explore coding, robotics, sports, music, and arts societies with one-click membership.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/50">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-2 font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Participate in Events</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Register for hackathons, guest lectures, matches, and jams with live seat capacity tracking.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-2 font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Earn Verified Points</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Receive strictly 5 points per verified attendance session and compete on the university leaderboards.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Startup Intro Animation</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Each time ClubSphere starts, a sleek, decent opening splash screen loads campus modules.
                    You can replay this intro at any time by clicking the ClubSphere logo in the sidebar or login view, or skip it immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Role Architecture & Access Control</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  ClubSphere enforces strict role-based access control (RBAC) to ensure structural integrity and privacy.
                </p>
              </div>

              <div className="space-y-3">
                {/* Admin */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-indigo-600 text-white"><Shield className="w-3.5 h-3.5" /></span>
                    <h4 className="font-bold text-slate-900 text-sm">Administrator (App Controller)</h4>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white uppercase">Controller</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li><strong>Full Administrative Authority:</strong> Create, edit, and delete clubs and events across all departments.</li>
                    <li><strong>User & Role Management:</strong> Promote or adjust roles for students and coordinators.</li>
                    <li><strong>Strict Controller Isolation:</strong> Admins <em>cannot</em> join clubs as student members and <em>cannot</em> register for events as attendees.</li>
                    <li><strong>No Personal Attendance Logging:</strong> Attendance tracking is disabled for admin accounts.</li>
                    <li><strong>Points Section Removed:</strong> Personal points badges are stripped from the admin view; admins are completely excluded from student leaderboards.</li>
                    <li><strong>Password Security:</strong> Passwords can be changed via the secure form only after providing the verified past password.</li>
                  </ul>
                </div>

                {/* Coordinator */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-purple-600 text-white"><Users className="w-3.5 h-3.5" /></span>
                    <h4 className="font-bold text-slate-900 text-sm">Club Coordinator</h4>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">Organizer</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Coordinates their assigned club, schedules workshops and competitions.</li>
                    <li>Accesses the Attendance Verification Hub to mark students Present or Absent.</li>
                    <li>Oversees club rosters and updates meeting schedules.</li>
                  </ul>
                </div>

                {/* Student */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-blue-600 text-white"><GraduationCap className="w-3.5 h-3.5" /></span>
                    <h4 className="font-bold text-slate-900 text-sm">Student Member</h4>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">Participant</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Browses and joins official campus clubs with active membership tracking.</li>
                    <li>Registers for upcoming events, hackathons, and activities.</li>
                    <li>Accumulates 5 points per verified attendance and earns campus honour badges.</li>
                    <li>Ranks on the university Activity Points and Attendance Position leaderboards.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POINTS & ATTENDANCE */}
          {activeTab === 'points' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Participation Points & Attendance System</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  ClubSphere uses a transparent, deterministic mathematical model for merit calculations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Deterministic Points Rule
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 font-mono text-center text-sm font-bold text-emerald-400">
                  Total Points = Verified Attended Sessions × 5 pts
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Every time a coordinator or admin verifies a student's attendance as <strong>Present</strong>,
                  the system credits exactly 5 participation points. No arbitrary bonuses are awarded;
                  merit is directly tied to campus engagement.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Dual Leaderboard Structure:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="font-bold text-slate-900 block mb-1">🏆 Activity Points Leaderboard</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Ranks students by total points earned. Top 3 are honored on the podium with gold, silver, and bronze crowns.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="font-bold text-slate-900 block mb-1">📊 Attendance Positions Leaderboard</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Ranks students strictly by attendance reliability rate (attended sessions ÷ total events) with status badges (Top / Good / Regular).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-xs text-blue-900">
                <strong>Cohort Filtering:</strong> Leaderboards can be filtered by Year (1st Year / 2nd Year) and Section (Sec A / Sec B) to compare peers accurately.
              </div>
            </div>
          )}

          {/* TAB 4: CLUBS & EVENTS */}
          {activeTab === 'clubs-events' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Clubs & Events User Guide</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Step-by-step instructions for discovering, joining, and participating.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    How to Join or Leave a Club
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Navigate to the <strong>College Clubs</strong> tab from the sidebar.</li>
                    <li>Click on any club card (e.g., Coding Club or Music Club) to view its details, meeting times, and coordinators.</li>
                    <li>Click <strong>Join Club</strong> to become a member instantly.</li>
                    <li>To leave, open the club details and click <strong>Leave Club</strong>.</li>
                    <li><em>Note: Administrators see an "App Controller" badge and cannot join as student members.</em></li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    How to Register for an Event
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Navigate to the <strong>Events & Calendar</strong> tab.</li>
                    <li>Review the upcoming sessions, locations, and seat capacities.</li>
                    <li>Click <strong>Register</strong> on any upcoming event. Your seat is confirmed immediately.</li>
                    <li>On the day of the event, attend the session and present your name to the coordinator for check-in.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Security, Privacy & Password Management</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  ClubSphere implements enterprise-grade security practices to protect sensitive university credentials.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Zero Credential Exposure Policy
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Admin login credentials are <strong>never</strong> hardcoded, pre-filled, or displayed in client forms.</li>
                    <li>Form inputs initialize completely blank on load.</li>
                    <li>Sessions are authenticated using HMAC-SHA256 stateless tokens with encrypted storage.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    How to Change Your Password (Past-Password Verification)
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                    <li>When logged in, open the <strong>Admin Console</strong> or click the key icon in the sidebar.</li>
                    <li>Click the <strong>Change Password</strong> button.</li>
                    <li>Enter your <strong>Current (Past) Password</strong> for cryptographic verification.</li>
                    <li>Enter your <strong>New Password</strong> (minimum 6 characters).</li>
                    <li>Confirm the change. The backend verifies the current password and hashes the new one using modern <code>scrypt</code> with a unique 16-byte cryptographic salt.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900 mb-1">Frequently Asked Questions</h3>

              <div className="space-y-2.5">
                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-800 list-none flex items-center justify-between">
                    <span>Why can't the Admin join clubs or register for events?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 border-t border-slate-100 pt-2">
                    In ClubSphere, the Admin acts strictly as the <strong>Controller of the App</strong>.
                    To prevent conflicts of interest and preserve student leaderboard fairness, admins manage clubs rather than participating in them.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-800 list-none flex items-center justify-between">
                    <span>Why is the Points section missing for the Admin account?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 border-t border-slate-100 pt-2">
                    Admins do not earn student attendance points or compete on the student leaderboard.
                    The points counter and leaderboard placements are exclusively designated for registered student accounts.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-800 list-none flex items-center justify-between">
                    <span>How can I replay the startup intro animation?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 border-t border-slate-100 pt-2">
                    Simply click the <strong>ClubSphere logo</strong> in the sidebar (desktop) or on the login page at any time to replay the opening sequence.
                  </p>
                </details>

                <details className="p-3.5 rounded-xl border border-slate-200 bg-white group cursor-pointer">
                  <summary className="font-bold text-xs text-slate-800 list-none flex items-center justify-between">
                    <span>How do coordinators log attendance?</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed pl-1 border-t border-slate-100 pt-2">
                    Go to the <strong>Attendance Tracking</strong> tab, pick an event, and toggle <strong>Present</strong> (+5 pts) or <strong>Absent</strong> for each student on the roster.
                  </p>
                </details>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Need further assistance? Contact your campus IT coordinator.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
