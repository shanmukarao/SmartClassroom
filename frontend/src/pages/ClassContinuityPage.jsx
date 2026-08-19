import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Clock, CheckCircle2, Circle, FileText, Video, BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';

export default function ClassContinuityPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch classes first
    const endpoint = user.role === 'student' ? '/student/classes' : '/teacher/classes';
    api.get(endpoint)
      .then(res => {
        const clsList = res.data.classes || [];
        setClasses(clsList);
        if (clsList.length > 0) {
          setSelectedClassId(clsList[0].id);
        }
      })
      .catch(err => console.error('Fetch classes error:', err));
  }, [user.role]);

  const fetchPackages = () => {
    if (!selectedClassId) return;
    setLoading(true);
    api.get(`/continuity/class/${selectedClassId}`)
      .then(res => {
        setPackages(res.data.packages || []);
      })
      .catch(err => console.error('Fetch packages error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedClassId]);

  const handleToggleTask = (taskId, currentCompleted) => {
    if (user.role !== 'student') return;
    api.post(`/continuity/task/${taskId}/toggle`, { completed: !currentCompleted })
      .then(() => {
        fetchPackages();
      })
      .catch(err => console.error('Toggle task error:', err));
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-purple-600" />;
      case 'assignment': return <FileText className="w-4 h-4 text-amber-600" />;
      case 'quiz': return <HelpCircle className="w-4 h-4 text-rose-600" />;
      default: return <BookOpen className="w-4 h-4 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('missedClasses')} & Continuity Packages</h2>
              <p className="text-xs text-slate-500">
                Self-paced learning packages to bridge class missed days cleanly without falling behind.
              </p>
            </div>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Class:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.subject_name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Missed Class Packages</h3>
          <p className="text-xs text-slate-500 mt-1">There are no catch-up packages published for this class.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200 uppercase">
                      {pkg.subject_name}
                    </span>
                    <span className="text-xs text-slate-500">• Session Date: {pkg.class_date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{pkg.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{pkg.summary_notes}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{pkg.progress_pct}% Completed</span>
                    <span className="block text-[11px] text-slate-500">{pkg.completed_tasks} of {pkg.total_tasks} tasks</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                    <div className="w-full h-full rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {pkg.progress_pct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Catch-Up Task Checklist
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {pkg.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.is_completed)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        task.is_completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button type="button" className="text-slate-400 hover:text-emerald-600 transition-all">
                          {task.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div className="flex items-center space-x-2">
                          {getTaskIcon(task.task_type)}
                          <span className={`text-xs font-semibold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {task.task_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
