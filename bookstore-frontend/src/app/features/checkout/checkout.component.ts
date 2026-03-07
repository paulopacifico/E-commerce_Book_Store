import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="checkout-placeholder">
      <h1>Checkout</h1>
      <p>Checkout flow will be implemented here.</p>
      <a routerLink="/cart" class="btn">Back to Cart</a>
    </div>
  `,
  styles: [
    `
      .checkout-placeholder {
        padding: 2rem 0;
      }
      .btn {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #0d6efd;
        color: #fff;
        text-decoration: none;
        border-radius: 6px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {}
