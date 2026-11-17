import id from './id.json';
import en from './en.json';
import type { Language } from '../types';

export const locales = { id, en } as const;

export type LocaleSchema = typeof id;

export function getTranslation(
  lang: Language,
  path: string,
  vars?: Record<string, string | number>
): string {
  const dict = locales[lang] || locales.id;
  const parts = path.split('.');
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      current = undefined;
      break;
    }
  }

  let result = typeof current === 'string' ? current : path;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return result;
}
