import en from './en.json';
import vi from './vi.json';

export type Locale = 'en' | 'vi';
export const defaultLocale: Locale = 'vi';

const dictionaries: Record<Locale, Record<string, string>> = { en, vi };

export function translate(key: string, locale: Locale): string {
  return dictionaries[locale]?.[key] ?? key;
}
