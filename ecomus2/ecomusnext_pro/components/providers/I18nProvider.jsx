"use client";

import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

// Configuration i18next pour App Router
const resources = {
  en: {
    common: {
      welcome: "Welcome",
      loading: "Loading...",
      error: "Error",
    },
  },
  fr: {
    common: {
      welcome: "Bienvenue",
      loading: "Chargement...",
      error: "Erreur",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
  });

export default function I18nProvider({ children }) {
  useEffect(() => {
    // Initialize i18n instance
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  return children;
}
