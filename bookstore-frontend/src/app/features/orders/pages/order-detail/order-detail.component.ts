import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { OrderService } from '../../data-access/order.service';
import type { Order } from '../../models/order.interface';
import { OrderItemSubtotalPipe } from '../../../../shared/pipes/order-item-subtotal.pipe';
import { OrderSubtotalPipe } from '../../../../shared/pipes/order-subtotal.pipe';
import { ShippingDisplayPipe } from '../../../../shared/pipes/shipping-display.pipe';
import { StatusIndexPipe } from '../../../../shared/pipes/status-index.pipe';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderItemSubtotalPipe,
    OrderSubtotalPipe,
    ShippingDisplayPipe,
    StatusIndexPipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order$: Observable<Order | null> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) return of(null);
      return this.orderService.getOrderById(id).pipe(catchError(() => of(null)));
    }),
  );

  readonly statusSteps = STATUS_STEPS;
}
