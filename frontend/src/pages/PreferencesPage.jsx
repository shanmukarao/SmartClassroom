import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Settings, Globe, Eye, CheckCircle2 } from 'lucide-react';

export default function PreferencesPage() {
  const { lang, setLang, t } = useLanguage();
  const [preferences, setPreferences] = useState({
    language: 'en',
    accessibility_needs: 'Visual aid preference',
    captioning_enabled: 1,
    preferred_format: 'visual',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/student/preferences')
      .then(res => {
        if (res.data.preferences) {
          setPreferences(res.data.preferences);
          if (res.data.preferences.language) {
            setLang(res.data.preferences.language);
          }
        }
      })
      .catch(err => console.error('Fetch preferences error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/student/preferences', preferences);
      setLang(preferences.language);
      setMessage('Preferences saved successfully.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('preferences')}</h2>
          <p className="text-xs text-slate-500">Configure language and non-sensitive accessibility preferences.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Globe className="w-4 h-4 text-brand-600 mr-2" />
            {t('selectLanguage')} / భాషను ఎంచుకోండి
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, language: 'en' })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                preferences.language === 'en'
                  ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 font-bold text-brand-900'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
              }`}
            >
              <span className="block text-sm">English</span>
              <span className="text-[11px] text-slate-500">Default interface language</span>
            </button>

            <button
              type="button"
              onClick={() => setPreferences({ ...preferences, language: 'te' })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                preferences.language === 'te'
                  ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 font-bold text-brand-900'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
              }`}
            >
              <span className="block text-sm">తెలుగు (Telugu)</span>
              <span className="text-[11px] text-slate-500">తెలుగు ఇంటర్‌ఫేస్ మరియు సహాయం</span>
            </button>
          </div>
        </div>

        {/* Accessibility Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Eye className="w-4 h-4 text-inclusive-teal mr-2" />
            Classroom Support & Learning Preferences
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Learning Resource Format
              </label>
              <select
                value={preferences.preferred_format}
                onChange={(e) => setPreferences({ ...preferences, preferred_format: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="visual">Visual Diagrams & Infographics</option>
                <option value="interactive">Interactive Practice Applets</option>
                <option value="audio-visual">Audio-Visual Video Explanations</option>
                <option value="textual">Step-by-Step Written Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Video Captioning Preference
              </label>
              <select
                value={preferences.captioning_enabled}
                onChange={(e) => setPreferences({ ...preferences, captioning_enabled: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value={1}>Enable Automatic Video Subtitles/Captions</option>
                <option value={0}>Standard Audio Output</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Accessibility Note for Teacher (Optional)
            </label>
            <input
              type="text"
              value={preferences.notes || ''}
              onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
              placeholder="e.g. Requires high contrast slides or larger font sizes."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
