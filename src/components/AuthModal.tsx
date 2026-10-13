import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building, Shield, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'demo';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'demo' }) => {
  const { login, register, switchDemoUser } = useAuth();
  const { success, error } = useToast();

  const [tab, setTab] = useState<'login' | 'register' | 'demo'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDepartment, setRegDepartment] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      error('Please enter your email');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      success('Welcome back!', 'Signed in successfully');
      onClose();
    } catch (err: any) {
      error(err.message || 'Login failed');
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
    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        studentId: regStudentId.trim() || undefined,
        department: regDepartment.trim() || undefined,
      });
      success('Account Created!', 'Welcome to ClubSphere. 50 bonus points awarded!');
      onClose();
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await switchDemoUser(role);
      success('Persona Activated', `Now browsing as ${role.toUpperCase()}`);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to switch demo persona');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> ClubSphere ID
          </div>
          <h2 className="text-xl font-bold tracking-tight">Access Your Portal</h2>
          <p className="text-xs text-slate-300 mt-1">Switch personas or sign in with your college credentials</p>

          {/* Tab buttons */}
          <div className="flex bg-navy-950/50 p-1 rounded-xl mt-4 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setTab('demo')}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                tab === 'demo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Demo Personas
            </button>
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                tab === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                tab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-3">
                Experience all role-based capabilities with a single click:
              </p>


              {/* Student demo */}
              <button
                onClick={() => handleDemoSelect('student')}
                disabled={isSubmitting}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">Alex Rivera</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Student
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">alex.rivera@college.edu • 280 points</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Coordinator demo */}
              <button
                onClick={() => handleDemoSelect('coordinator')}
                disabled={isSubmitting}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    ML
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">Maya Lin</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Coordinator
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">Robotics Club Lead • Marks Attendance</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Admin demo */}
              <button
                onClick={() => handleDemoSelect('admin')}
                disabled={isSubmitting}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    RV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">Prof. Vance</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Admin
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block">Director Student Affairs • Full Console</span>
                  </div>
                </div>
                <Check className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jane.doe@college.edu"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="coordinator">Club Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student / Staff ID
                  </label>
                  <input
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="CS-2026-99"
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Computer Science & Engineering"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
