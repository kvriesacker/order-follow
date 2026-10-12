import { Component } from '@angular/core';
import { T } from './i18n/i18n';

/** Opened without an order in the link: there is nothing else to see here. */
@Component({
  selector: 'app-no-order',
  imports: [T],
  template: `
    <main class="track">
      <p class="track-big">🍕</p>
      <p class="track-big">{{ 'This link has no order in it. Scan the QR code at the shop again.' | t }}</p>
    </main>
  `,
})
export class NoOrder {}
