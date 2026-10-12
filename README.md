# Order follow

The page a pizza customer opens by scanning the QR code on the shop's order screen. It shows
that one order live: its number, name and pizzas, the estimated ready time, and the steps
(ordered, being made, baked, ready to collect). The phone buzzes and, if the customer allows
alerts, gets a notification when the pizza goes into the oven and when it's ready.

It's a separate app from the staff app ([order-queue](https://github.com/kvriesacker/order-queue))
on purpose: customers only ever get this page, which has no links, menus or settings, and
knows nothing but their own order.

Live at https://kvriesacker.github.io/order-follow/ (an order is `#/<order id>`).

## How it works

- The pizza queue app saves each order for its customer in Firestore (`tracks/<hash>`), in the
  same Firebase project, encrypted with a key derived from the order id. The document id is a
  hash too, so the link in the QR code only opens that one order and never the queue.
- This page signs in anonymously, listens to that one document and decrypts it in the browser.
- It speaks the shop's language (Dutch or English, set in the pizza queue's Settings).
- Installable (manifest and service worker), because iPhones only show alerts for pages added
  to the Home Screen.
- Keep `src/app/tracking.ts` and `src/app/queue-crypto.ts` in step with the same files in
  order-queue. The Firestore rules live in order-queue; `firestore.rules` here is a copy for the
  test emulator.

## Development

```bash
npm ci
npx ng serve                    # http://localhost:4200/#/<order id>
npx ng test --watch=false       # unit tests
npx ng build && npx playwright test   # browser tests, with the Firebase emulator (needs Java 21)
```

Pushing to `main` runs the tests and publishes the build to GitHub Pages (Settings → Pages →
Source: GitHub Actions).
