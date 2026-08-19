import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { te } from '../locales/te';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('sih_language') || 'en');

  useEffect(() => {
    localStorage.setItem('sih_language', lang);
  }, [lang]);

  const dictionary = lang === 'te' ? te : en;

  const t = (key) => {
    return dictionary[key] || en[key] || key;
  };

  const toggleLanguage = (newLang) => {
    if (newLang) setLang(newLang);
    else setLang((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
