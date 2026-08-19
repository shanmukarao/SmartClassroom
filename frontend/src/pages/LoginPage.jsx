import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Shield, GraduationCap, UserCheck, Lock, Globe, ArrowRight, Sparkles, User } from 'lucide-react';

export default function LoginPage() {
  const { demoLogin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('');
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch users when a role is selected
  useEffect(() => {
    if (!selectedRole) {
      setUserList([]);
      setSelectedUserId('');
      return;
    }

    setLoadingUsers(true);
    setError('');
    setSelectedUserId('');

    api.get(`/auth/users-by-role/${selectedRole}`)
      .then((res) => {
        setUserList(res.data.users || []);
      })
      .catch((err) => {
        console.error('Fetch users by role error:', err);
        setError('Failed to load user list for selected role.');
      })
      .finally(() => setLoadingUsers(false));
  }, [selectedRole]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your role first.');
      return;
    }
    if (!selectedUserId) {
      setError('Please select your user name from the list.');
      return;
    }

    setSubmitting(true);

    try {
      const user = await demoLogin(selectedUserId, selectedRole);
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate selected user.');
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
            <p className="text-xs text-brand-200">SIH Prototype • Demo Access Portal</p>
          </div>
        </div>

        <button
          onClick={() => toggleLanguage()}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-medium backdrop-blur-md transition-all"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'en' ? 'English' : 'తెలుగు'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto my-8 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Prototype Authentication
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Select Your Role & Profile</h2>
          <p className="text-xs text-slate-500">Choose a portal role, select your user profile, and click Continue.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-6">
          {/* Step 1: Role Selection Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Select your role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Student Role Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 ${
                  selectedRole === 'student'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'student' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">{t('roleStudent')}</span>
                  <span className="text-[10px] text-slate-500">Student Portal</span>
                </div>
              </button>

              {/* Teacher Role Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 ${
                  selectedRole === 'teacher'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/30 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'teacher' ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-700'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">{t('roleTeacher')}</span>
                  <span className="text-[10px] text-slate-500">Faculty Portal</span>
                </div>
              </button>

              {/* Admin Role Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 ${
                  selectedRole === 'admin'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30 shadow-md'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'admin' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold">{t('roleAdmin')}</span>
                  <span className="text-[10px] text-slate-500">Admin Control</span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: User Selection Dropdown/List */}
          {selectedRole && (
            <div className="space-y-2 pt-2 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Select your user profile ({userList.length} Available)
              </label>

              {loadingUsers ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                  <span>Loading available {selectedRole}s...</span>
                </div>
              ) : userList.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-1">
                  <User className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-800">
                    No {selectedRole} accounts available yet.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ask a System Administrator to create a {selectedRole} account in the Admin Portal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
                  {userList.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedUserId === user.id
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 font-bold text-brand-900 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900">{user.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {user.roll_number
                              ? `Roll: ${user.roll_number} • ${user.grade_level} (${user.section})`
                              : user.department
                              ? `${user.designation} • ${user.department}`
                              : user.email}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedUserId === user.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {selectedUserId === user.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Continue Button */}
          <button
            type="submit"
            disabled={submitting || !selectedRole || !selectedUserId}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-inclusive-teal text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-brand-600/30 disabled:opacity-40 flex items-center justify-center space-x-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 max-w-xl mx-auto space-y-1">
        <p className="flex items-center justify-center space-x-1">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Privacy Principle: Adapt support to student needs without public labeling or rankings.</span>
        </p>
      </div>
    </div>
  );
}
