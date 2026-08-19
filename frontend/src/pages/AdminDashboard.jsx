import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/StatCard';
import NewUserModal from '../components/NewUserModal';
import {
  Users,
  Building,
  BookOpen,
  HelpCircle,
  Shield,
  Plus,
  Sparkles,
  Layers,
  FolderLock
} from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const fetchAdminData = () => {
    setLoading(true);
    api.get('/admin/dashboard')
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error('Admin dashboard error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const { counts = {}, classroomStats = [], subjectStats = [], recentSignals = [] } = data || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-900/30">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Administrator Control Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">{t('adminPortal')}</h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Monitor platform system analytics, classroom utilization, and user role enrollments.
          </p>
        </div>

        <button
          onClick={() => setIsUserModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createUser')}</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('roleStudent')}
          value={counts.studentCount || 0}
          subtitle="Registered learners"
          icon={Users}
          color="teal"
        />
        <StatCard
          title={t('totalTeachers')}
          value={counts.teacherCount || 0}
          subtitle="Faculty members"
          icon={Shield}
          color="brand"
        />
        <StatCard
          title={t('totalClasses')}
          value={counts.classCount || 0}
          subtitle="Academic sections"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title={t('totalClassrooms')}
          value={counts.classroomCount || 0}
          subtitle="Smart classrooms"
          icon={Building}
          color="amber"
        />
      </div>

      {/* Classroom Utilization & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{t('classroomUtilization')}</h3>
            <span className="text-xs text-slate-500 font-medium">Physical Infrastructure</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
                  <th className="pb-3">Room / Building</th>
                  <th className="pb-3">Capacity</th>
                  <th className="pb-3">Assigned Classes</th>
                  <th className="pb-3">Total Enrolled</th>
                  <th className="pb-3">Utilization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {classroomStats.map((room) => {
                  const utilPct = room.capacity > 0 ? Math.round(((room.total_enrolled || 0) / room.capacity) * 100) : 0;
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-semibold text-slate-900">
                        {room.room_number} <span className="text-slate-500 font-normal">({room.building})</span>
                      </td>
                      <td className="py-3 text-slate-600">{room.capacity} seats</td>
                      <td className="py-3 text-slate-600">{room.assigned_classes || 0} sections</td>
                      <td className="py-3 font-semibold text-brand-700">{room.total_enrolled || 0} students</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          utilPct > 90 
                            ? 'bg-rose-100 text-rose-800' 
                            : utilPct > 50 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {utilPct}% Capacity
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform System Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Subject Overview</h3>
          <div className="space-y-3">
            {subjectStats.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{sub.name}</h4>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  {sub.total_classes} Classes
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <FolderLock className="w-4 h-4" />
              <span>Privacy Safeguard Active</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Administrators view system aggregate metrics only. Individual confidential help request messages remain strictly scoped to authorized subject teachers.
            </p>
          </div>
        </div>
      </div>

      <NewUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={fetchAdminData}
      />
    </div>
  );
}
