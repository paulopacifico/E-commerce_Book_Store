import { AuthGuard } from './core/guards/auth.guard';
import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('keeps the cart available to guests', () => {
    const cartRoute = appRoutes.find((route) => route.path === 'cart');

    expect(cartRoute).toBeDefined();
    expect(cartRoute?.canActivate).toBeUndefined();
  });

  it('keeps checkout protected until the guest authenticates', () => {
    const checkoutRoute = appRoutes.find((route) => route.path === 'checkout');

    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute?.canActivate).toEqual([AuthGuard]);
  });
});
