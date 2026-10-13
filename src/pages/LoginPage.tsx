import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles, Mail, Lock, User as UserIcon, Building,
  Eye, EyeOff, Loader2, Shield, GraduationCap, ArrowRight,
  BookOpen, Users
} from 'lucide-react';
import type { StudentYear, StudentSection, Gender } from '../types';
import { generateAnimatedAvatarDataUri } from '../utils/avatarGenerator';

type Tab = 'login' | 'register';

interface LoginPageProps {
  onReplayIntro?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onReplayIntro }) => {
  const { login, register } = useAuth();
  const { success, error } = useToast();

  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state (Students only - Admin is predefined)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regYear, setRegYear] = useState<StudentYear>(1);
  const [regSection, setRegSection] = useState<StudentSection>('A');
  const [regGender, setRegGender] = useState<Gender>('male');

  const avatarPreviewUri = useMemo(() => {
    return generateAnimatedAvatarDataUri(regGender, regName.trim() || 'student');
  }, [regGender, regName]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      success('Welcome back!', 'Signed in successfully');
    } catch (err: any) {
      error(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      error('Please fill in all required fields');
      return;
    }
    if (regPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: 'student',
        studentId: regStudentId.trim() || undefined,
        department: regDepartment.trim() || undefined,
        year: regYear,
        section: regSection,
        gender: regGender,
      });
      success('Account Created!', 'Welcome to ClubSphere!');
    } catch (err: any) {
      error(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (email: string, password: string, label: string) => {
    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Signed In', `Welcome, ${label}!`);
    } catch (err: any) {
      error(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* ─── LEFT PANEL – Branding ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-gradient-to-br from-navy-950 via-indigo-950 to-navy-950 p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center justify-between z-10">
          <button
            onClick={onReplayIntro}
            type="button"
            title="Replay opening animation"
            className="flex items-center gap-3 text-left group transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block">ClubSphere</span>
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Activities Tracker</span>
            </div>
          </button>
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              type="button"
              className="px-2.5 py-1 rounded-full bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/30 text-[11px] text-indigo-300 font-medium transition-all"
            >
              Replay Intro
            </button>
          )}
        </div>

        {/* Hero text */}
        <div className="z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            College Club Management Platform
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Your College<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Activity Hub
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Discover clubs, register for events, track your attendance, earn points,
            and climb the leaderboard — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['🎯 Club Discovery', '📅 Event Calendar', '✅ Attendance Tracking', '🏆 Leaderboard', '🎖️ Achievements'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Quick access demo */}
        <div className="z-10">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Quick Demo Access</p>
          <button
            onClick={() => quickLogin('alex.rivera@college.edu', 'student123', 'Alex Rivera')}
            disabled={isSubmitting}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-400/40 transition-all group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-xs font-black">AR</div>
            <div>
              <div className="text-xs font-bold text-white">Alex Rivera</div>
              <div className="text-[10px] text-blue-300 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Explore as Student
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* ─── RIGHT PANEL – Form ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-900 relative">
        {/* Mobile logo */}
        <button
          onClick={onReplayIntro}
          type="button"
          title="Replay opening animation"
          className="lg:hidden flex items-center gap-2 mb-8 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-white">ClubSphere</span>
        </button>

        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex bg-slate-800 p-1 rounded-2xl mb-7 border border-slate-700/60">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* ── SIGN IN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-400 mt-1">Sign in to your ClubSphere account</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 font-medium">or try demo</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              {/* Quick demo student login */}
              <button
                type="button"
                onClick={() => quickLogin('alex.rivera@college.edu', 'student123', 'Alex Rivera')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">AR</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">Alex Rivera</div>
                    <div className="text-[10px] text-blue-400 font-semibold">Try Student Demo</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Student Account</h2>
                <p className="text-sm text-slate-400 mt-1">Join ClubSphere as a student and earn 50 bonus points</p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">College Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="jane@college.edu"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-3 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Gender & Animated Avatar Preview */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Gender & Avatar
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-animated avatar</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Avatar preview */}
                  <div className="relative group shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/20 bg-slate-900">
                      <img
                        src={avatarPreviewUri}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center border border-white/40">
                      {regGender === 'male' ? '♂' : regGender === 'female' ? '♀' : '✦'}
                    </span>
                  </div>

                  {/* Gender selector buttons */}
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRegGender('male')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                        regGender === 'male'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      ♂ Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('female')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                        regGender === 'female'
                          ? 'bg-pink-600/20 border-pink-500 text-pink-300 ring-1 ring-pink-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      ♀ Female
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('other')}
                      className={`py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                        regGender === 'other'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      ✦ Other
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Classification: Year & Section (For Students) */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Academic Classification
                  </label>
                  <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60">
                    {regYear === 1 ? '1st Year' : '2nd Year'} • Section {regSection}
                  </span>
                </div>

                {/* Year selection */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Select Year:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegYear(1)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        regYear === 1
                          ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      1st Year
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegYear(2)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        regYear === 2
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      2nd Year
                    </button>
                  </div>
                </div>

                {/* Section selection */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Select Section:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegSection('A')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        regSection === 'A'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Section A
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegSection('B')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        regSection === 'B'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Section B
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><Sparkles className="w-4 h-4" /><span>Create Account</span></>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-600 mt-6">
            By signing in you agree to ClubSphere's terms of service.<br />
            <span className="text-slate-500">Sign in with your campus account.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
