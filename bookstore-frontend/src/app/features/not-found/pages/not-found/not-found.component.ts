import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: false,
  template: `
    <div class="not-found">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-message">Page not found.</p>
      <a routerLink="/books" class="btn">Back to Books</a>
    </div>
  `,
  styles: [
    `
      .not-found {
        text-align: center;
        padding: 4rem 1rem;
      }
      .not-found-title {
        margin: 0 0 0.5rem;
        font-size: 3rem;
        font-weight: 700;
        color: #333;
      }
      .not-found-message {
        margin: 0 0 1.5rem;
        font-size: 1.125rem;
        color: #666;
      }
      .btn {
        display: inline-block;
        padding: 0.75rem 1.25rem;
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
        background: #1976d2;
        border-radius: 4px;
        text-decoration: none;
      }
      .btn:hover {
        background: #1565c0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
