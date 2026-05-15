import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import type { AuthResponse } from '../models/auth.interface';

const TOKEN_KEY = 'authToken';
const IDENTITY_KEY = 'authIdentity';

export type AuthSessionEvent =
  | { type: 'authenticated'; replacedSession: boolean }
  | { type: 'cleared' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readStoredToken());
  private readonly identitySubject = new BehaviorSubject<string | null>(this.readStoredIdentity());
  private readonly sessionEventsSubject = new Subject<AuthSessionEvent>();
  readonly token$ = this.tokenSubject.asObservable();
  readonly sessionEvents$ = this.sessionEventsSubject.asObservable();

  /** Emits when authentication state changes (login/logout). */
  readonly isAuthenticated$ = this.token$.pipe(
    map((token) => token != null),
    distinctUntilChanged(),
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
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

  getCartStorageScope(): string {
    const identity = this.identitySubject.value;
    if (!this.tokenSubject.value || !identity) {
      return 'guest';
    }

    return `user:${encodeURIComponent(identity)}`;
  }

  private storeSession(response: AuthResponse): void {
    const token = response.accessToken ?? response.token;
    if (!token) return;
    const identity = this.normalizeIdentity(response.email);
    const currentToken = this.tokenSubject.value;
    const replacedSession = currentToken != null && currentToken !== token;
    this.tokenSubject.next(token);
    this.identitySubject.next(identity);
    localStorage.setItem(TOKEN_KEY, token);
    if (identity) {
      localStorage.setItem(IDENTITY_KEY, identity);
    } else {
      localStorage.removeItem(IDENTITY_KEY);
    }
    this.sessionEventsSubject.next({ type: 'authenticated', replacedSession });
  }

  private clearSession(): void {
    this.tokenSubject.next(null);
    this.identitySubject.next(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IDENTITY_KEY);
    this.sessionEventsSubject.next({ type: 'cleared' });
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readStoredIdentity(): string | null {
    return this.normalizeIdentity(localStorage.getItem(IDENTITY_KEY));
  }

  private normalizeIdentity(value: string | null | undefined): string | null {
    const normalized = value?.trim().toLowerCase();
    return normalized ? normalized : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
