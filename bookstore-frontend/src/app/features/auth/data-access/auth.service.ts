import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { CartStateService } from '../../cart/data-access/cart-state.service';
import type { AuthResponse } from '../models/auth.interface';

const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readStoredToken());
  readonly token$ = this.tokenSubject.asObservable();

  /** Emits when authentication state changes (login/logout). */
  readonly isAuthenticated$ = this.token$.pipe(
    map((token) => token != null),
    distinctUntilChanged(),
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly cartStateService: CartStateService,
  ) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email: username, password }).pipe(
      tap((res) => this.storeSession(res)),
      catchError(this.handleError),
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        email,
        password,
        firstName: username,
        lastName: username,
      })
      .pipe(
        tap((res) => this.storeSession(res)),
        catchError(this.handleError),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.tokenSubject.value != null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private storeSession(response: AuthResponse): void {
    const token = response.accessToken ?? response.token;
    if (!token) return;
    this.tokenSubject.next(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  private clearSession(): void {
    this.cartStateService.clearCart();
    this.tokenSubject.next(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
