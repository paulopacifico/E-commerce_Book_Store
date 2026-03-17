import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, shareReplay, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import type { Book, PageResponse } from '../models/book.interface';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/books`;

  constructor(private readonly http: HttpClient) {}

  getBooks(page?: number, size?: number, sort?: string): Observable<PageResponse<Book>> {
    let params = new HttpParams();
    if (page != null) params = params.set('page', page);
    if (size != null) params = params.set('size', size);
    if (sort) {
      const [sortBy, sortDir] = sort.includes(',') ? sort.split(',') : [sort, 'asc'];
      params = params.set('sortBy', sortBy.trim());
      params = params.set('sortDir', (sortDir?.trim() ?? 'asc').toLowerCase());
    }
    return this.http
      .get<PageResponse<Book>>(this.apiUrl, { params })
      .pipe(retry({ count: 2, delay: 500 }), catchError(this.handleError));
  }

  getBookById(id: number): Observable<Book> {
    return this.http
      .get<Book>(`${this.apiUrl}/${id}`)
      .pipe(retry({ count: 2, delay: 500 }), catchError(this.handleError), shareReplay(1));
  }

  getBooksByCategory(
    categoryId: number,
    page?: number,
    size?: number,
  ): Observable<PageResponse<Book>> {
    let params = new HttpParams();
    if (page != null) params = params.set('page', page);
    if (size != null) params = params.set('size', size);
    return this.http
      .get<PageResponse<Book>>(`${this.apiUrl}/category/${categoryId}`, { params })
      .pipe(retry({ count: 2, delay: 500 }), catchError(this.handleError));
  }

  searchBooks(query: string, categoryId?: number): Observable<Book[]> {
    if (categoryId != null) {
      return this.http
        .get<PageResponse<Book>>(`${this.apiUrl}/category/${categoryId}`, {
          params: new HttpParams().set('page', 0).set('size', 100),
        })
        .pipe(
          retry({ count: 2, delay: 500 }),
          map((res) => res.content),
          catchError(this.handleError),
        );
    }
    return this.http
      .get<PageResponse<Book>>(`${this.apiUrl}/search`, {
        params: new HttpParams().set('keyword', query).set('page', 0).set('size', 100),
      })
      .pipe(
        retry({ count: 2, delay: 500 }),
        map((res) => res.content),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
