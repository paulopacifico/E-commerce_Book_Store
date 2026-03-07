import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import type { Book, PageResponse, BookQueryParams, BookSearchParams } from '../models/book.interface';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/books`;

  constructor(private readonly http: HttpClient) {}

  getBooks(params?: BookQueryParams): Observable<PageResponse<Book>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page != null) httpParams = httpParams.set('page', params.page);
      if (params.size != null) httpParams = httpParams.set('size', params.size);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<PageResponse<Book>>(this.apiUrl, { params: httpParams }).pipe(
      retry({ count: 2, delay: 500 }),
      catchError(this.handleError)
    );
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      retry({ count: 2, delay: 500 }),
      catchError(this.handleError)
    );
  }

  searchBooks(params: BookSearchParams): Observable<PageResponse<Book>> {
    let httpParams = new HttpParams().set('keyword', params.keyword);
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.size != null) httpParams = httpParams.set('size', params.size);
    return this.http.get<PageResponse<Book>>(`${this.apiUrl}/search`, { params: httpParams }).pipe(
      retry({ count: 2, delay: 500 }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
