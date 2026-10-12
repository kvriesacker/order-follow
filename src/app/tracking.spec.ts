import { describe, expect, it } from 'vitest';
import { OrderTrack, partReady, sponsorAt, trackAlert } from './tracking';

const base: OrderTrack = { shop: 'Napoli', number: 7, customer: 'Anna', pizzas: '1× Margherita', status: 'new', stage: 'ordered' };
const at = (patch: Partial<OrderTrack>): OrderTrack => ({ ...base, ...patch });

describe('trackAlert', () => {
  it('alerts once when the order goes into the oven and once when it is ready', () => {
    expect(trackAlert(at({}), at({ status: 'in-progress', stage: 'preparing' }))).toBeNull();
    expect(trackAlert(at({ stage: 'preparing' }), at({ status: 'in-progress', stage: 'baking' }))).toBe('baking');
    expect(trackAlert(at({ stage: 'baking' }), at({ stage: 'baking', eta: 123 }))).toBeNull();
    expect(trackAlert(at({ status: 'ready', stage: 'baking' }), at({ status: 'ready-for-customer', stage: 'ready' }))).toBe('ready');
    expect(trackAlert(at({ status: 'ready-for-customer', stage: 'ready' }), at({ status: 'ready-for-customer', stage: 'ready' }))).toBeNull();
  });

  it('says nothing about what was already true when the page opened', () => {
    expect(trackAlert(null, at({ stage: 'baking' }))).toBeNull();
    expect(trackAlert(null, at({ status: 'ready-for-customer', stage: 'ready' }))).toBeNull();
  });

  it('alerts for the oven once, even when the first pizza is baked between two updates', () => {
    expect(trackAlert(at({ stage: 'preparing' }), at({ status: 'in-progress', stage: 'baked' }))).toBe('baking');
    expect(trackAlert(at({ stage: 'baking' }), at({ status: 'ready', stage: 'baked' }))).toBeNull();
  });

  it('alerts each time more of a split order is ready, and not when a pizza is picked up', () => {
    const items = (...ready: (boolean | 'handed')[]) =>
      ready.map((r) => ({ name: 'Margherita', stage: r ? ('ready' as const) : ('baking' as const), handed: r === 'handed' }));
    const split = (...ready: (boolean | 'handed')[]) => at({ status: 'in-progress', stage: 'baking', items: items(...ready) });
    expect(trackAlert(split(false, false, false), split(true, false, false))).toBe('part-ready');
    expect(trackAlert(split(true, false, false), split('handed', false, false))).toBeNull();
    expect(trackAlert(split('handed', false, false), split('handed', true, false))).toBe('part-ready');
    expect(partReady(split('handed', true, false))).toBe(1);
    expect(partReady(at({ status: 'ready-for-customer', items: items(true) }))).toBe(0);
  });

  it('skips straight to ready when baking and calling happen between two updates', () => {
    expect(trackAlert(at({ stage: 'preparing' }), at({ status: 'ready-for-customer', stage: 'ready' }))).toBe('ready');
  });
});

describe('sponsorAt', () => {
  it('shows the sponsors in turn, the same one everywhere at the same moment', () => {
    const t = at({ sponsors: [{ name: 'A', message: '' }, { name: 'B', message: 'hi' }], sponsorSeconds: 5 });
    expect(sponsorAt(t, 0)?.name).toBe('A');
    expect(sponsorAt(t, 4999)?.name).toBe('A');
    expect(sponsorAt(t, 5000)?.name).toBe('B');
    expect(sponsorAt(t, 10000)?.name).toBe('A');
    expect(sponsorAt(at({}), 0)).toBeNull();
  });
});
