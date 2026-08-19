import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';
import AskHelpModal from '../components/AskHelpModal';
import {
  BookOpen,
  Clock,
  HelpCircle,
  CheckCircle2,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    api.get('/student/dashboard')
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const { student, classes = [], missedPackages = [], announcements = [], helpRequests = [], progress = {} } = data || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-inclusive-teal text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t('welcome')}, {student?.roll_number ? student.roll_number : 'Student'}!
          </h2>
          <p className="text-sm text-brand-100 max-w-xl">
            Access your registered classes, missed lecture continuity packages, and ask private questions to your teacher.
          </p>
        </div>

        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition-all shadow-lg shadow-amber-400/20 hover:scale-105 shrink-0"
        >
          <HelpCircle className="w-5 h-5" />
          <span>{t('askForHelp')}</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('classes')}
          value={classes.length}
          subtitle="Active enrollments"
          icon={BookOpen}
          color="brand"
        />
        <StatCard
          title={t('attendanceRate')}
          value={`${progress.attendancePct || 92}%`}
          subtitle="Recent 14 sessions"
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          title={t('assessmentAverage')}
          value={`${progress.quizAvg || 86}%`}
          subtitle="Continuous evaluation"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title={t('catchUpProgress')}
          value={`${progress.completedCatchupPackages || 0} / ${progress.totalCatchupPackages || 0}`}
          subtitle="Packages completed"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Missed Classes / Continuity Packages Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('missedClasses')} & Continuity Packages</h3>
              <p className="text-xs text-slate-500">Access structured catch-up notes, videos & self-evaluations</p>
            </div>
          </div>
        </div>

        {missedPackages.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-500">You have no pending missed class continuity packages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missedPackages.map((pkg) => (
              <div
                key={pkg.package_id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-500 bg-slate-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {pkg.subject_name}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{pkg.title}</h4>
                    <span className="text-xs text-slate-500">Lecture Date: {pkg.class_date}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pkg.progress_pct === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pkg.progress_pct}% {t('completed')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{pkg.summary_notes}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-inclusive-teal h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pkg.progress_pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{pkg.completed_tasks} of {pkg.total_tasks} tasks completed</span>
                    <span>{pkg.progress_pct}%</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/student/missed')}
                  className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>{t('completeTasks')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid for Enrolled Classes & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Classes List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{t('todaysClasses')}</h3>
            <span className="text-xs text-slate-500 font-medium">{classes.length} Enrolled</span>
          </div>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/80 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {cls.subject_code}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{cls.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Instructor: {cls.teacher_name} • Room: {cls.room_number || 'R-101'} ({cls.building || 'Science Block'})
                  </p>
                  <p className="text-xs text-slate-600 font-medium">Schedule: {cls.schedule_time}</p>
                </div>

                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-semibold transition-all shrink-0"
                >
                  {t('askForHelp')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements Column */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">{t('announcements')}</h3>
          </div>

          {announcements.length === 0 ? (
            <p className="text-xs text-slate-500">{t('noData')}</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                      {ann.class_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Trigger */}
      <AskHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        classes={classes}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
