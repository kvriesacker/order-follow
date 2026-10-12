import { expect, test } from '@playwright/test';
import { OrderTrack } from '../src/app/tracking';
import { newOrderId, orderPage, saveOrder } from './orders';

const anna: OrderTrack = {
  shop: 'Napoli',
  number: 7,
  customer: 'Anna',
  pizzas: '2× Margherita, 1× Funghi',
  status: 'new',
  stage: 'ordered',
  stages: { ordered: 3 },
  eta: Date.now() + 20 * 60000,
  lang: 'nl',
};

test('follows the order live, in the shop language, until it is ready', async ({ page }) => {
  const id = newOrderId();
  await saveOrder(id, anna);
  await page.goto(orderPage(id));
  const track = page.locator('.track');
  await expect(track).toContainText('Napoli');
  await expect(page.locator('.track-number')).toHaveText('7');
  await expect(track).toContainText('Anna');
  await expect(track).toContainText('2× Margherita, 1× Funghi');
  await expect(track).toContainText('Klaar rond');
  await expect(page.locator('.track-steps li.done')).toHaveText(['Besteld']);
  await expect(page).toHaveTitle('Bestelling 7 · Napoli');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');

  // One of the three pizzas goes in the oven: that step is partly done.
  await saveOrder(id, { ...anna, status: 'in-progress', stage: 'baking', stages: { preparing: 2, baking: 1 } });
  await expect(page.locator('.track-alert')).toHaveText('Je pizza zit in de oven!');
  await expect(page.locator('.track-steps li.done')).toHaveText(['Besteld', 'Wordt belegd']);
  await expect(page.locator('.track-steps li.part')).toHaveText([/In de oven\s*1 van 3/]);

  await saveOrder(id, { ...anna, status: 'ready', stage: 'baked', stages: { baked: 3 } });
  await expect(page.locator('.track-steps li.done')).toHaveText(['Besteld', 'Wordt belegd', 'In de oven', 'Gebakken']);

  await saveOrder(id, { ...anna, status: 'ready-for-customer', stage: 'ready', stages: { ready: 3 }, eta: undefined });
  await expect(track).toHaveClass(/is-ready/);
  await expect(track).toContainText('Klaar! Haal je bestelling op aan de balie.');
  await expect(page.locator('.track-steps li.done')).toHaveCount(5);

  await saveOrder(id, { ...anna, status: 'collected', stage: null, eta: undefined });
  await expect(track).toContainText('Afgehaald. Smakelijk!');
});

test('speaks English when the shop does', async ({ page }) => {
  const id = newOrderId();
  await saveOrder(id, { ...anna, lang: 'en', status: 'cancelled' });
  await page.goto(orderPage(id));
  await expect(page.locator('.track')).toContainText('This order was cancelled. Please ask at the counter.');
  await expect(page).toHaveTitle('Order 7 · Napoli');
  await expect(page.locator('.track-steps')).toHaveCount(0);
});

test('waits for an order that is still being taken', async ({ page }) => {
  const id = newOrderId();
  await page.goto(orderPage(id));
  await expect(page.getByText('Je bestelling opzoeken…')).toBeVisible();
  await expect(page.getByText(/Je bestelling wordt nog opgenomen/)).toBeVisible({ timeout: 12_000 });
  await saveOrder(id, anna);
  await expect(page.locator('.track-number')).toHaveText('7');
});

test('offers alerts, or says they are blocked', async ({ page }) => {
  const id = newOrderId();
  await saveOrder(id, anna);
  await page.goto(orderPage(id));
  await expect(page.locator('.track-number')).toHaveText('7');
  // Some browsers (like the one on the deploy server) block alerts until asked; then it says so.
  if ((await page.evaluate(() => Notification.permission)) === 'default') {
    await expect(page.getByRole('button', { name: 'Verwittig me als ze in de oven zit en klaar is' })).toBeVisible();
  } else {
    await expect(page.getByText(/Meldingen zijn voor deze site geblokkeerd/)).toBeVisible();
  }
});

test('only shows the one order: no links anywhere, and nothing without an order id', async ({ page }) => {
  const id = newOrderId();
  await saveOrder(id, anna);
  await page.goto(orderPage(id));
  await expect(page.locator('.track-number')).toHaveText('7');
  await expect(page.locator('a')).toHaveCount(0);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);

  await page.goto('/?emulator=127.0.0.1');
  await expect(page.getByText(/Deze link bevat geen bestelling/)).toBeVisible();
  // A wrong or made-up id never shows someone else's order.
  await page.goto(orderPage('not-an-order'));
  await expect(page.getByText('Je bestelling opzoeken…')).toBeVisible();
});
