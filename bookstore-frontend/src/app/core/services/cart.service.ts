import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type {
  CartResponse,
  CartItem,
  AddToCartRequest,
  UpdateCartRequest,
} from '../models/cart.interface';

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

  updateItem(cartItemId: number, quantity: number): Observable<CartItem> {
    const body: UpdateCartRequest = { quantity };
    return this.http
      .put<CartItem>(`${this.apiUrl}/update/${cartItemId}`, body)
      .pipe(catchError(this.handleError));
  }

  removeItem(cartItemId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/remove/${cartItemId}`)
      .pipe(catchError(this.handleError));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
