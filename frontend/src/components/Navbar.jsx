import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Globe, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-inclusive-teal flex items-center justify-center text-white shadow-md">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
              {t('appTitle')}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3 h-3 mr-1" /> SIH 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {t('tagline')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Multilingual Selector */}
        <button
          onClick={() => toggleLanguage()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition-all shadow-2xs"
          title="Switch Language / భాషను మార్చండి"
        >
          <Globe className="w-4 h-4 text-brand-600" />
          <span>{lang === 'en' ? 'English' : 'తెలుగు'}</span>
        </button>

        {/* User Info & Role Badge */}
        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-900">{user.name}</span>
              <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                {user.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm border border-slate-300">
              {user.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
