import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Clock,
  FolderLock,
  Bell,
  Settings,
  ShieldAlert,
  Users,
  Building
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const role = user.role;

  const studentNav = [
    { to: '/student', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/student/help', label: t('helpRequests'), icon: HelpCircle },
    { to: '/student/missed', label: t('missedClasses'), icon: Clock },
    { to: '/student/resources', label: t('resources'), icon: BookOpen },
    { to: '/student/announcements', label: t('announcements'), icon: Bell },
    { to: '/student/preferences', label: t('preferences'), icon: Settings },
  ];

  const teacherNav = [
    { to: '/teacher', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/teacher/help-insights', label: 'Help Insights', icon: HelpCircle },
    { to: '/teacher/signals', label: 'Support Signals', icon: ShieldAlert },
    { to: '/teacher/continuity', label: 'Class Continuity', icon: Clock },
    { to: '/teacher/resources', label: t('resources'), icon: BookOpen },
    { to: '/teacher/announcements', label: t('announcements'), icon: Bell },
  ];

  const adminNav = [
    { to: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/classes', label: 'Classes & Subjects', icon: BookOpen },
    { to: '/admin/classrooms', label: 'Classrooms', icon: Building },
  ];

  const navItems = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0 shadow-lg">
      <div className="space-y-6">
        <div>
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {role} Portal Navigation
          </div>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/student' || item.to === '/teacher' || item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-900/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Privacy Notice Banner in Sidebar */}
      <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
          <FolderLock className="w-4 h-4" />
          <span>Privacy Protected</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Student dignity & confidential help requests are safeguarded without public ranking.
        </p>
      </div>
    </aside>
  );
}
