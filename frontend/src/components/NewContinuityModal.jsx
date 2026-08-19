import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Clock, Plus, Trash2, X, CheckCircle } from 'lucide-react';

export default function NewContinuityModal({ isOpen, onClose, classes = [], onSuccess }) {
  const { t } = useLanguage();
  const [selectedClass, setSelectedClass] = useState('');
  const [title, setTitle] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [tasks, setTasks] = useState([
    { title: 'Read Chapter Lecture Notes', task_type: 'reading', resource_link: '' },
    { title: 'Watch Video Explanation', task_type: 'video', resource_link: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  if (!isOpen) return null;

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', task_type: 'reading', resource_link: '' }]);
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedClass || !title || !classDate) {
      setError('Please fill in all required package details.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/continuity', {
        class_id: selectedClass,
        title,
        class_date: classDate,
        summary_notes: summaryNotes,
        tasks
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create continuity package.');
    } fontFinally: {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('createContinuityPackage')}</h3>
            <p className="text-xs text-slate-500">Structured catch-up notes and interactive tasks for students missing class.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Target Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Package Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quadratic Equations Catch-Up"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Class Date
              </label>
              <input
                type="date"
                required
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Lecture Summary & Teacher Notes
            </label>
            <textarea
              rows={3}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Provide key lecture highlights and concepts covered..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          {/* Dynamic Catch-up Tasks */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Catch-Up Tasks ({tasks.length})
              </label>
              <button
                type="button"
                onClick={handleAddTask}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {tasks.map((task, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={task.title}
                  onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <select
                  value={task.task_type}
                  onChange={(e) => handleTaskChange(idx, 'task_type', e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="reading">Reading</option>
                  <option value="video">Video</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                </select>
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-600/30 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
