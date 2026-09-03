import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { af } from './af';
import { LanguageCode } from '../types';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

type Translations = typeof en;

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = safeGetItem('hv_language') as LanguageCode;
    return saved === 'af' || saved === 'en' ? saved : 'af'; // Default to Afrikaans for local community, easily switchable to EN
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    safeSetItem('hv_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = language === 'af' ? af : en;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
