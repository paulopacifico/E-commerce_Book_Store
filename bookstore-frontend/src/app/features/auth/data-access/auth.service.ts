import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import type { AuthResponse } from '../models/auth.interface';

const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly authSubject = new BehaviorSubject<boolean>(this.hasStoredToken());

  /** Emits when authentication state changes (login/logout). */
  readonly isAuthenticated$ = this.authSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email: username, password })
      .pipe(
        tap((res) => {
          this.storeToken(res);
          this.authSubject.next(true);
        }),
        catchError(this.handleError)
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
        tap((res) => {
          this.storeToken(res);
          this.authSubject.next(true);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.authSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasStoredToken();
  }

  private hasStoredToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Sync subject with current storage (e.g. after page reload). */
  refreshAuthState(): void {
    this.authSubject.next(this.hasStoredToken());
  }

  private storeToken(response: AuthResponse): void {
    const token = response.accessToken ?? response.token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
