import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NewAnnouncementModal from '../components/NewAnnouncementModal';
import { Bell, Plus, Calendar, AlertCircle } from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    if (user.role === 'teacher') {
      api.get('/teacher/classes').then(res => setClasses(res.data.classes || []));
    }
    api.get('/announcements')
      .then(res => setAnnouncements(res.data.announcements || []))
      .catch(err => console.error('Fetch announcements error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user.role]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('announcements')} Feed</h2>
            <p className="text-xs text-slate-500">Class notifications, examination schedules, and office hours.</p>
          </div>
        </div>

        {user.role === 'teacher' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createAnnouncement')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                    {ann.class_name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    ann.priority === 'urgent' ? 'bg-rose-600 text-white' : ann.priority === 'important' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ann.priority}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(ann.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>

              <div className="pt-2 text-[11px] text-slate-400">
                Posted by {ann.teacher_name} ({ann.subject_name})
              </div>
            </div>
          ))}
        </div>
      )}

      {user.role === 'teacher' && (
        <NewAnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classes={classes}
          onSuccess={fetchAnnouncements}
        />
      )}
    </div>
  );
}
