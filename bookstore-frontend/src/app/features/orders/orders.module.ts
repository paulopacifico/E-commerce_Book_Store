import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { ordersRoutes } from './orders.routes';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';

@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ordersRoutes),
    SharedModule,
  ],
})
export class OrdersModule {}
