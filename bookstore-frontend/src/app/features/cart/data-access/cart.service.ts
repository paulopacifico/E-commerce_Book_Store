import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import type {
  CartResponse,
  CartItem,
  AddToCartRequest,
  UpdateCartRequest,
} from '../models/cart.interface';

/**
 * Backend adapter for cart endpoints.
 * UI cart state should flow through CartStateService to avoid duplicate sources of truth.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(catchError(this.handleError));
  }

  addToCart(bookId: number, quantity: number): Observable<CartItem> {
    const body: AddToCartRequest = { bookId, quantity };
    return this.http.post<CartItem>(`${this.apiUrl}/add`, body).pipe(catchError(this.handleError));
  }

  updateCartItem(itemId: number, quantity: number): Observable<CartItem> {
    const body: UpdateCartRequest = { quantity };
    return this.http
      .put<CartItem>(`${this.apiUrl}/update/${itemId}`, body)
      .pipe(catchError(this.handleError));
  }

  removeCartItem(itemId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/remove/${itemId}`)
      .pipe(catchError(this.handleError));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
