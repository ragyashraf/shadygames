'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { COPY, LANG_STORAGE_KEY, parseLang, type Copy, type Lang } from '@/lib/i18n/copy';

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Copy;
  ar: boolean;
  dir: 'ltr' | 'rtl';
};

const LangContext = createContext<LangContextValue | null>(null);

function applyDocumentLang(lang: Lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dataset.lang = lang;
}

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const fromStorage = parseLang(localStorage.getItem(LANG_STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.match(/(?:^|; )shady-lang=([^;]*)/);
    const fromCookie = parseLang(match ? decodeURIComponent(match[1]) : null);
    if (fromCookie) return fromCookie;
  } catch {
    /* ignore */
  }
  return 'en';
}

function persistLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `shady-lang=${lang};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* ignore */
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readStoredLang();
    setLangState(saved);
    applyDocumentLang(saved);
    setReady(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    persistLang(next);
    applyDocumentLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: COPY[lang],
      ar: lang === 'ar',
      dir: lang === 'ar' ? 'rtl' : 'ltr',
    }),
    [lang, setLang, toggleLang]
  );

  return (
    <LangContext.Provider value={value}>
      <div className={ready ? undefined : 'lang-pending'} suppressHydrationWarning>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang must be used within LangProvider');
  }
  return ctx;
}
