import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Shield, GraduationCap, UserCheck, Lock, Globe, ArrowRight, Sparkles, Key, CheckCircle, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState('quick'); // 'quick' or 'custom'
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('student123');
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update default credentials when role changes in Quick Mode
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'student') {
      setEmail('student@example.com');
      setPassword('student123');
    } else if (role === 'teacher') {
      setEmail('teacher@example.com');
      setPassword('teacher123');
    } else if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    }
  };

  // Fetch users when selectedRole changes
  useEffect(() => {
    if (!selectedRole) return;
    api.get(`/auth/users-by-role/${selectedRole}`)
      .then((res) => {
        const users = res.data.users || [];
        setUserList(users);
        if (users.length > 0) {
          setSelectedUserId(users[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedRole]);

  const handleQuickLogin = async (role) => {
    setSubmitting(true);
    setError('');
    try {
      const user = await demoLogin(role);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await login(email, password, selectedRole);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Inclusive Smart Classroom</h1>
            <p className="text-xs text-brand-200">SIH Prototype • Standalone Demo Portal</p>
          </div>
        </div>

        <button
          onClick={() => toggleLanguage()}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'en' ? 'English' : 'తెలుగు'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-2xl w-full mx-auto my-8 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Smart Education • PS ID: NRIIT-EDU-01
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Demo Login Portal</h2>
          <p className="text-xs text-slate-500">Select a demo role below to launch the interactive prototype instantly.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Quick Demo Access Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Zap className="w-4 h-4 text-amber-500 mr-1.5" /> 1-Click Quick Role Launch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Student Card */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950">Student Portal</h3>
                  <span className="text-[10px] text-emerald-700 font-medium">Rahul Sharma (CSE-A)</span>
                </div>
              </div>
              <div className="text-[11px] bg-white/80 p-2 rounded-lg text-slate-600 border border-emerald-100 space-y-0.5">
                <div><span className="font-semibold text-slate-700">Email:</span> student@example.com</div>
                <div><span className="font-semibold text-slate-700">Pass:</span> student123</div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Login as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Teacher Card */}
            <div className="p-4 rounded-2xl border border-brand-200 bg-brand-50/60 hover:bg-brand-50 transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-brand-950">Teacher Portal</h3>
                  <span className="text-[10px] text-brand-700 font-medium">Dr. A. Sharma (CSE)</span>
                </div>
              </div>
              <div className="text-[11px] bg-white/80 p-2 rounded-lg text-slate-600 border border-brand-100 space-y-0.5">
                <div><span className="font-semibold text-slate-700">Email:</span> teacher@example.com</div>
                <div><span className="font-semibold text-slate-700">Pass:</span> teacher123</div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher')}
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Login as Teacher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Admin Card */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition-all flex flex-col justify-between space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950">Admin Portal</h3>
                  <span className="text-[10px] text-amber-700 font-medium">System Administrator</span>
                </div>
              </div>
              <div className="text-[11px] bg-white/80 p-2 rounded-lg text-slate-600 border border-amber-100 space-y-0.5">
                <div><span className="font-semibold text-slate-700">Email:</span> admin@example.com</div>
                <div><span className="font-semibold text-slate-700">Pass:</span> admin123</div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={submitting}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Login as Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Credential Login Option */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Key className="w-4 h-4 text-brand-600 mr-1.5" /> Direct Credential Authentication
            </span>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 max-w-xl mx-auto space-y-1">
        <p className="flex items-center justify-center space-x-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Core Privacy Principle: Adapt classroom support to student needs without public labeling or rankings.</span>
        </p>
      </div>
    </div>
  );
}
