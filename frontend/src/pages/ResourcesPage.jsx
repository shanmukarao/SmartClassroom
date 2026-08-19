import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NewResourceModal from '../components/NewResourceModal';
import { BookOpen, ExternalLink, Plus, FileText, Video, Globe } from 'lucide-react';

export default function ResourcesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [resources, setResources] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchResources = () => {
    setLoading(true);
    if (user.role === 'teacher') {
      api.get('/teacher/classes').then(res => setClasses(res.data.classes || []));
    }
    api.get('/resources')
      .then(res => setResources(res.data.resources || []))
      .catch(err => console.error('Fetch resources error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResources();
  }, [user.role]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('resources')} Library</h2>
            <p className="text-xs text-slate-500">Subject learning notes, formula guides, and interactive visualizers.</p>
          </div>
        </div>

        {user.role === 'teacher' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t('uploadResource')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <div key={res.id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {res.subject_name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {res.resource_type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{res.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{res.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">By {res.teacher_name}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {user.role === 'teacher' && (
        <NewResourceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          classes={classes}
          onSuccess={fetchResources}
        />
      )}
    </div>
  );
}
