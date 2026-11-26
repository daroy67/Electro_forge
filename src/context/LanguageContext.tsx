import React, { createContext, useContext, useState, useEffect } from "react";
import { AppLanguage } from "../types";
import {
  TRANSLATIONS,
  Translations,
  localizeText,
  getComponentName as getCompNameHelper,
  getComponentDesc as getCompDescHelper,
  getDeviceDisplayName as getDeviceNameHelper,
  getCategoryDisplayName as getCategoryNameHelper,
} from "../i18n/translations";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  tr: (ru: string, en: string) => string;
  localize: (text: string) => string;
  getComponentName: (typeOrName: string, fallback?: string) => string;
  getComponentDesc: (typeOrName: string, fallback?: string) => string;
  getDeviceName: (deviceId: string, fallback?: string) => string;
  getCategoryName: (cat: string) => string;
  isRu: boolean;
  isEn: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
}> = ({ children, initialLanguage, onLanguageChange }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (initialLanguage) return initialLanguage;
    try {
      const saved = localStorage.getItem("electroforge_app_language");
      if (saved === "ru" || saved === "en") return saved;
    } catch {}
    return "ru";
  });

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("electroforge_app_language", newLang);
      localStorage.setItem("electroforge_language_selected", "true");
    } catch {}
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: AppLanguage = language === "ru" ? "en" : "ru";
    setLanguage(nextLang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;
  const isRu = language === "ru";
  const isEn = language === "en";

  const tr = (ru: string, en: string): string => {
    return isRu ? ru : en;
  };

  const localize = (text: string): string => {
    return localizeText(text, language);
  };

  const getComponentName = (typeOrName: string, fallback?: string): string => {
    return getCompNameHelper(typeOrName, language, fallback);
  };

  const getComponentDesc = (typeOrName: string, fallback?: string): string => {
    return getCompDescHelper(typeOrName, language, fallback);
  };

  const getDeviceName = (deviceId: string, fallback?: string): string => {
    return getDeviceNameHelper(deviceId, language, fallback);
  };

  const getCategoryName = (cat: string): string => {
    return getCategoryNameHelper(cat, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tr,
        localize,
        getComponentName,
        getComponentDesc,
        getDeviceName,
        getCategoryName,
        isRu,
        isEn,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    const fallbackLang: AppLanguage = "ru";
    const t = TRANSLATIONS[fallbackLang];
    return {
      language: fallbackLang,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t,
      tr: (ru, en) => ru,
      localize: (text) => text,
      getComponentName: (typeOrName, fallback) => fallback || typeOrName,
      getComponentDesc: (typeOrName, fallback) => fallback || "",
      getDeviceName: (id, fallback) => fallback || id,
      getCategoryName: (cat) => cat,
      isRu: true,
      isEn: false,
    };
  }
  return context;
}
