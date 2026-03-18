import { Routes } from '@angular/router';

import { OrderListComponent } from './pages/order-list/order-list.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

export const ordersRoutes: Routes = [
  { path: '', component: OrderListComponent, data: { animation: 'OrdersListPage' } },
  { path: ':id', component: OrderDetailComponent, data: { animation: 'OrderDetailPage' } },
];
