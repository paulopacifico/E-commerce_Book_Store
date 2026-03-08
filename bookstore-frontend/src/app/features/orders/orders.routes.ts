import { Routes } from '@angular/router';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

export const ordersRoutes: Routes = [
  { path: '', component: OrderListComponent },
  { path: ':id', component: OrderDetailComponent },
];
