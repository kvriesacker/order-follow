import { Pipe, PipeTransform, signal } from '@angular/core';
import { NL } from './nl';

/** The languages the page speaks. Dutch is the default. */
export type Lang = 'nl' | 'en';

export function isLang(value: unknown): value is Lang {
  return value === 'nl' || value === 'en';
}

/** The shop's language, which comes with the order. Dutch until the order is loaded. */
export const lang = signal<Lang>('nl');

/** For dates and times: Dutch ones in Dutch (24-hour clock), the browser's own in English. */
export function dateLocale(): string[] {
  return lang() === 'nl' ? ['nl-BE'] : [];
}

/**
 * The text in the current language. Texts are written in English in the code and looked up in
 * the Dutch list; `{name}` placeholders are filled from `params`.
 */
export function t(text: string, params?: Record<string, string | number>): string {
  const s = lang() === 'nl' ? (NL[text] ?? text) : text;
  return params ? s.replace(/\{(\w+)\}/g, (all, key) => (key in params ? String(params[key]) : all)) : s;
}

/** `{{ 'Your order' | t }}` or `{{ 'Order {n}' | t: { n: 7 } }}` in templates. */
@Pipe({ name: 't', pure: false })
export class T implements PipeTransform {
  transform(text: string, params?: Record<string, string | number>): string {
    return t(text, params);
  }
}

/** "18:45": a time as clocks in the current language show it. */
export function clockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' });
}

/** "12 min" until a timestamp, or "any minute" when it's (nearly) due. */
export function minutesUntil(ts: number, now: number): string {
  const minutes = Math.round((ts - now) / 60000);
  return minutes <= 1 ? t('any minute') : t('{n} min', { n: minutes });
}
