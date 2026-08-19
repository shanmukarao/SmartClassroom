import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';
import NewContinuityModal from '../components/NewContinuityModal';
import NewAnnouncementModal from '../components/NewAnnouncementModal';
import NewResourceModal from '../components/NewResourceModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users,
  HelpCircle,
  ShieldAlert,
  Clock,
  PlusCircle,
  Bell,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen
} from 'lucide-react';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContinuityModalOpen, setIsContinuityModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [activeSignalTab, setActiveSignalTab] = useState('all');

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/teacher/dashboard')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error('Teacher dashboard fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateSignal = (signalId, status) => {
    api.put(`/teacher/signals/${signalId}`, { status, teacher_notes: 'Reviewed during office hours check-in.' })
      .then(() => fetchDashboard())
      .catch((err) => console.error('Signal update error:', err));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const {
    teacher,
    classes = [],
    totalStudentsCount = 0,
    pendingHelpRequestsCount = 0,
    topicConfusion = [],
    supportSignals = [],
    continuityPackages = [],
    accessibilitySummary = [],
    announcements = []
  } = data || {};

  const filteredSignals = supportSignals.filter((s) => {
    if (activeSignalTab === 'all') return true;
    if (activeSignalTab === 'active') return s.status === 'active';
    return s.status === activeSignalTab;
  });

  const chartColors = ['#0284c7', '#0d9488', '#d97706', '#4f46e5', '#e11d48'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Teacher Classroom Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t('welcome')}, {teacher?.user_id ? 'Faculty' : 'Teacher'}!
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Monitor aggregated topic confusion, respond to privacy-aware support signals, and publish class continuity packages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsContinuityModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('createContinuityPackage')}</span>
          </button>
          <button
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>{t('createAnnouncement')}</span>
          </button>
          <button
            onClick={() => setIsResourceModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4 text-inclusive-teal" />
            <span>{t('uploadResource')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('assignedClasses')}
          value={classes.length}
          subtitle="Active academic sections"
          icon={BookOpen}
          color="brand"
        />
        <StatCard
          title={t('totalStudents')}
          value={totalStudentsCount}
          subtitle="Enrolled across sections"
          icon={Users}
          color="teal"
        />
        <StatCard
          title={t('pendingHelpRequests')}
          value={pendingHelpRequestsCount}
          subtitle="Confidential student queries"
          icon={HelpCircle}
          color="amber"
        />
        <StatCard
          title={t('supportSignalsTitle')}
          value={supportSignals.length}
          subtitle="Assistive alerts requiring review"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Row 1: Aggregated Topic Confusion Chart & Class Continuity Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aggregated Topic Confusion Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('topicConfusionChart')}</h3>
              <p className="text-xs text-slate-500">{t('topicConfusionDesc')}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Identity Protected
            </span>
          </div>

          {topicConfusion.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">{t('noData')}</p>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicConfusion} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="topic_name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="request_count" radius={[6, 6, 0, 0]} name="Help Requests">
                    {topicConfusion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Class Continuity Completion Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{t('classContinuityProgress')}</h3>
            <button
              onClick={() => setIsContinuityModalOpen(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              + New Package
            </button>
          </div>

          {continuityPackages.length === 0 ? (
            <p className="text-xs text-slate-500">{t('noData')}</p>
          ) : (
            <div className="space-y-4">
              {continuityPackages.map((pkg) => (
                <div key={pkg.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800">{pkg.title}</span>
                    <span className="text-[10px] text-slate-400">{pkg.class_date}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pkg.completionPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{pkg.class_name}</span>
                    <span className="font-semibold text-brand-700">{pkg.completionPct}% Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Authorized Private Support Signals (Privacy-Aware Core Feature) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-slate-900">{t('supportSignalsTitle')}</h3>
            </div>
            <p className="text-xs text-slate-500">{t('supportSignalsDesc')}</p>
          </div>

          {/* Mandatory Disclaimer Box */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('disclaimerNotice')}</span>
          </div>
        </div>

        {/* Support Signals List */}
        {supportSignals.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No active support signals requiring attention.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <div
                key={signal.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  signal.severity === 'high'
                    ? 'bg-rose-50/40 border-rose-200'
                    : signal.severity === 'medium'
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        signal.severity === 'high'
                          ? 'bg-rose-600 text-white'
                          : signal.severity === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {signal.severity} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-900">{signal.student_name} ({signal.roll_number})</span>
                    <span className="text-xs text-slate-500">• {signal.class_name}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">{signal.metric_summary}</p>
                  <p className="text-[11px] text-slate-500 italic">"{signal.disclaimer}"</p>

                  {signal.teacher_notes && (
                    <p className="text-[11px] text-brand-700 font-medium">Notes: {signal.teacher_notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {signal.status === 'active' ? (
                    <button
                      onClick={() => handleUpdateSignal(signal.id, 'reviewed')}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all"
                    >
                      Mark Reviewed
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Classroom Accessibility Preferences Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">{t('studentAccessibilityNeeds')}</h3>
        <p className="text-xs text-slate-500">
          Non-sensitive aggregated accessibility preferences declared by enrolled students to assist classroom planning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {accessibilitySummary.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-brand-700 uppercase">
                Language: {item.language === 'te' ? 'తెలుగు' : 'English'}
              </span>
              <div className="text-sm font-bold text-slate-900">{item.accessibility_needs}</div>
              <p className="text-xs text-slate-500">
                Format: <span className="capitalize">{item.preferred_format}</span> • Captions: {item.captioning_enabled ? 'Required' : 'Optional'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <NewContinuityModal
        isOpen={isContinuityModalOpen}
        onClose={() => setIsContinuityModalOpen(false)}
        classes={classes}
        onSuccess={fetchDashboard}
      />
      <NewAnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        classes={classes}
        onSuccess={fetchDashboard}
      />
      <NewResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        classes={classes}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}
