import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, Lock, X, CheckCircle } from 'lucide-react';

export default function AskHelpModal({ isOpen, onClose, classes = [], onSuccess }) {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/help/topics/class/${selectedClass}`)
        .then(res => {
          setTopics(res.data.topics || []);
          if (res.data.topics.length > 0) {
            setSelectedTopic(res.data.topics[0].id);
          } else {
            setSelectedTopic('');
          }
        })
        .catch(err => console.error('Fetch topics error:', err));
    }
  }, [selectedClass]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedClass || !selectedTopic) {
      setError('Please select a class and topic.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/help', {
        class_id: selectedClass,
        topic_id: selectedTopic,
        description
      });
      setSuccessMsg('Your help request has been sent privately to your teacher.');
      setTimeout(() => {
        setSuccessMsg('');
        setDescription('');
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit help request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('askForHelp')}</h3>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              <Lock className="w-3 h-3 text-emerald-600 mr-1" />
              Confidential & visible only to your subject teacher.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-semibold text-slate-900">{successMsg}</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Select Class / Subject
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.subject_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Select Topic Area
              </label>
              {topics.length > 0 ? (
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-500 py-2">No predefined topics available for this class.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Description / Question (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe specifically where you are facing difficulty..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <strong>Privacy Assurance:</strong> Your request will not be shared with other students or displayed on public rankings.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : t('submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
