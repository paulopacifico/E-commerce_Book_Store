import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type { Order, CreateOrderRequest } from '../models/order.interface';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Creates an order from the current cart (checkout).
   * Backend: POST /orders/checkout — auth via JWT interceptor.
   */
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    return this.http
      .post<Order>(`${this.apiUrl}/checkout`, orderData)
      .pipe(catchError(this.handleError));
  }

  getOrders(): Observable<Order[]> {
    return this.http
      .get<Order[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getOrderById(id: number): Observable<Order> {
    return this.http
      .get<Order>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
