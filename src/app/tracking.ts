import { QueueCrypto } from './queue-crypto';

/** Where an order is, as the pizza queue app (order-queue) saves it. */
export type OrderStatus = 'new' | 'in-progress' | 'ready' | 'ready-for-customer' | 'collected' | 'cancelled';
/** The blocks of the shop's customer screen, in order: each pizza is in one of them. */
export type DisplayStage = 'ordered' | 'preparing' | 'baking' | 'baked' | 'ready';
export const DISPLAY_STAGES: DisplayStage[] = ['ordered', 'preparing', 'baking', 'baked', 'ready'];

/**
 * What a customer sees when following their own order. The pizza queue app stores it per
 * order in Firestore (tracks/<hash>), encrypted with a key derived from the order id, so the
 * link in the QR code never reveals the queue itself. Keep in step with order-queue's
 * src/app/tracking.ts.
 */
export interface OrderTrack {
  shop: string;
  number: number;
  customer: string;
  pizzas: string;
  status: OrderStatus;
  /**
   * The furthest block of the customer display the order's pizzas not yet called reached
   * (older versions don't send it).
   */
  stage?: DisplayStage | null;
  /** How many pizzas are in each block, as an order can be split (older versions don't send it). */
  stages?: Partial<Record<DisplayStage, number>>;
  /** Estimated ready time, cut to the minute; absent once the order is ready. */
  eta?: number;
  /** The shop's language, which this page speaks (older versions don't send it). */
  lang?: 'nl' | 'en';
}

export function trackCrypto(orderId: string): Promise<QueueCrypto> {
  return QueueCrypto.forQueue(`track:${orderId}`);
}

/** The Firestore document id for an order: a hash, not the order id itself. */
export function trackDocId(crypto: QueueCrypto): string {
  return crypto.topic.slice(crypto.topic.lastIndexOf('/') + 1);
}

export type TrackAlert = 'baking' | 'ready';

/**
 * What to tell a customer following their order: once when it goes into the oven and once when
 * it's ready to collect. Nothing for what was already true when they opened the page.
 */
export function trackAlert(before: OrderTrack | null, after: OrderTrack): TrackAlert | null {
  if (!before) return null;
  if (after.status === 'ready-for-customer' && before.status !== 'ready-for-customer') return 'ready';
  const rank = (t: OrderTrack) => (t.stage ? DISPLAY_STAGES.indexOf(t.stage) : -1);
  const oven = DISPLAY_STAGES.indexOf('baking');
  if (rank(after) >= oven && rank(before) < oven && before.status !== 'ready-for-customer') return 'baking';
  return null;
}
