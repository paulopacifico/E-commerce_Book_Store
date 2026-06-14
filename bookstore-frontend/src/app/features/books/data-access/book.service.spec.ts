import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import type { Book, PageResponse } from '../models/book.interface';
import { BookService } from './book.service';

describe('BookService', () => {
  const apiUrl = `${environment.apiUrl}/books`;
  let service: BookService;
  let httpController: HttpTestingController;

  const books: Book[] = [
    {
      id: 1,
      title: 'One Hundred Years of Solitude',
      author: 'Gabriel García Márquez',
      isbn: '9780060883287',
      description: 'A landmark of magical realism.',
      price: 18.5,
      stockQuantity: 4,
    },
    {
      id: 2,
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      isbn: '9780134494166',
      description: 'A guide to software structure.',
      price: 42.5,
      stockQuantity: 7,
    },
  ];

  const pageResponse = (content: Book[]): PageResponse<Book> => ({
    content,
    page: 0,
    size: 100,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BookService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('sends a trimmed keyword to the backend search endpoint', () => {
    let result: Book[] | undefined;

    service.searchBooks('  clean architecture  ').subscribe((value) => {
      result = value;
    });

    const req = httpController.expectOne(
      (request) => request.url === `${apiUrl}/search` && request.params.get('keyword') != null,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('clean architecture');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('100');

    req.flush(pageResponse([books[1]]));

    expect(result).toEqual([books[1]]);
  });

  it('filters category results by title, author, isbn, and description', () => {
    const queries: Array<[string, number]> = [
      ['solitude', 1],
      ['gabriel garcia', 1],
      ['9780134494166', 2],
      ['software structure', 2],
    ];

    for (const [query, expectedId] of queries) {
      let result: Book[] | undefined;

      service.searchBooks(query, 9).subscribe((value) => {
        result = value;
      });

      const req = httpController.expectOne((request) => request.url === `${apiUrl}/category/9`);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('100');
      req.flush(pageResponse(books));

      expect(result?.map((book) => book.id)).toEqual([expectedId]);
    }
  });

  it('returns all category books when the query is blank', () => {
    let result: Book[] | undefined;

    service.searchBooks('   ', 9).subscribe((value) => {
      result = value;
    });

    const req = httpController.expectOne((request) => request.url === `${apiUrl}/category/9`);
    req.flush(pageResponse(books));

    expect(result).toEqual(books);
  });
});
