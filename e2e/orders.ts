import { OrderTrack, trackCrypto, trackDocId } from '../src/app/tracking';

const FIRESTORE = 'http://127.0.0.1:8085/v1/projects/demo-pizza-queue/databases/(default)/documents';

/**
 * Saves an order the way the pizza queue app does (encrypted, under a hashed id) in the local
 * Firestore emulator. The emulator's admin token skips the rules, like a test fixture should.
 */
export async function saveOrder(orderId: string, track: OrderTrack): Promise<void> {
  const crypto = await trackCrypto(orderId);
  const response = await fetch(`${FIRESTORE}/tracks/${trackDocId(crypto)}`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer owner', 'content-type': 'application/json' },
    body: JSON.stringify({ fields: { data: { stringValue: await crypto.encrypt(track) } } }),
  });
  if (!response.ok) throw new Error(`Saving the order failed: ${response.status} ${await response.text()}`);
}

/** A new random order id, like the pizza queue app makes. */
export function newOrderId(): string {
  return Math.random().toString(36).slice(2, 12);
}

/** The page for one order, using the emulator. */
export function orderPage(orderId: string): string {
  return `/?emulator=127.0.0.1#/${orderId}`;
}
