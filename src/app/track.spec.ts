import { describe, expect, it } from 'vitest';
import { trackSteps } from './track';
import { OrderTrack } from './tracking';

const base: OrderTrack = { shop: 'Napoli', number: 7, customer: 'Anna', pizzas: '3× Margherita', status: 'in-progress' };
const steps = (patch: Partial<OrderTrack>) =>
  trackSteps({ ...base, ...patch }).map((s) => `${s.label}:${s.done ? 'done' : s.part ? `${s.part.n}/${s.part.total}` : '-'}`);

describe('trackSteps', () => {
  it('shows a split order step by step, pizza by pizza', () => {
    expect(steps({ stages: { preparing: 1, baking: 1, baked: 1 } })).toEqual([
      'Ordered:done', 'Being prepared:done', 'In the oven:2/3', 'Baked:1/3', 'Ready to collect:-',
    ]);
    expect(steps({ status: 'new', stages: { ordered: 3 } })).toEqual([
      'Ordered:done', 'Being prepared:-', 'In the oven:-', 'Baked:-', 'Ready to collect:-',
    ]);
    expect(steps({ status: 'ready-for-customer', stages: { ready: 3 } })).toEqual([
      'Ordered:done', 'Being prepared:done', 'In the oven:done', 'Baked:done', 'Ready to collect:done',
    ]);
  });

  it('follows the status alone for shops that send no pizza counts', () => {
    expect(steps({ stage: 'baking' })).toEqual([
      'Ordered:done', 'Being prepared:done', 'In the oven:done', 'Baked:-', 'Ready to collect:-',
    ]);
    expect(steps({ status: 'ready' })).toEqual([
      'Ordered:done', 'Being prepared:done', 'In the oven:done', 'Baked:done', 'Ready to collect:-',
    ]);
  });
});
