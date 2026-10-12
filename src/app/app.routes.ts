import { Routes } from '@angular/router';
import { Track } from './track';
import { NoOrder } from './no-order';

/** One page: the order in the link (#/<order id>). */
export const routes: Routes = [
  { path: '', component: NoOrder },
  { path: ':order', component: Track },
  { path: '**', redirectTo: '' },
];
