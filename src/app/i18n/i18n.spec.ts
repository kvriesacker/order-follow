import { afterEach, describe, expect, it } from 'vitest';
import { lang, minutesUntil, t } from './i18n';
import { NL } from './nl';

describe('i18n', () => {
  afterEach(() => lang.set('nl'));

  it('speaks Dutch by default and English when the shop does', () => {
    expect(t('Order {n}', { n: 7 })).toBe('Bestelling 7');
    lang.set('en');
    expect(t('Order {n}', { n: 7 })).toBe('Order 7');
  });

  it('counts down in minutes', () => {
    expect(minutesUntil(12 * 60000, 0)).toBe('12 min');
    expect(minutesUntil(60000, 0)).toBe('zo meteen');
  });

  it('has Dutch for every text', () => {
    for (const [en, nl] of Object.entries(NL)) expect(nl, en).toBeTruthy();
  });
});
