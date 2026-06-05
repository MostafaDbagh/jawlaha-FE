import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import { en } from './en';
import { ar } from './ar';
import { storage, StorageKeys } from '../lib/storage';

export type LangCode = 'en' | 'ar';

const TABLES: Record<LangCode, Record<string, string>> = { en, ar };

// Module-level mirror of the current language so a plain `t()` (no hook) works
// the same way GetX's `'key'.tr` works from anywhere.
let currentLang: LangCode = 'en';

export const getCurrentLang = (): LangCode => currentLang;
export const isRTL = (): boolean => currentLang === 'ar';

/**
 * Translate a key. Mirrors GetX `'key'.tr`.
 * Falls back to the English table, then to the raw key (like GetX does).
 * Supports `@name` style params via the optional `params` map.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let value = TABLES[currentLang]?.[key] ?? en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`@${k}`, 'g'), String(v));
    }
  }
  return value;
}

interface I18nContextValue {
  lang: LangCode;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLang: (lang: LangCode) => Promise<void>;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');
  const [ready, setReady] = useState(false);

  // Initialise from storage / device on mount.
  useEffect(() => {
    (async () => {
      const stored = (await storage.getString(StorageKeys.APP_LANGUAGE)) as LangCode | null;
      const initial: LangCode = stored === 'ar' || stored === 'en' ? stored : 'en';
      currentLang = initial;
      setLangState(initial);
      I18nManager.allowRTL(true);
      setReady(true);
    })();
  }, []);

  const setLang = useCallback(async (next: LangCode) => {
    currentLang = next;
    setLangState(next);
    await storage.setString(StorageKeys.APP_LANGUAGE, next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      isRTL: lang === 'ar',
      t: (key, params) => t(key, params),
      setLang,
      ready,
    }),
    [lang, setLang, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Convenience hook returning just the translate fn (re-renders on lang change). */
export function useT() {
  return useI18n().t;
}
