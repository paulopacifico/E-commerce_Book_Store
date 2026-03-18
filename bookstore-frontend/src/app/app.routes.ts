import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/pages/home/home.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { CartComponent } from './features/cart/pages/cart/cart.component';
import { CheckoutComponent } from './features/checkout/pages/checkout/checkout.component';
import { CategoriesComponent } from './features/categories/pages/categories/categories.component';
import { NotFoundComponent } from './features/not-found/pages/not-found/not-found.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'HomePage' } },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { animation: 'RegisterPage' },
  },
  {
    path: 'books',
    loadChildren: () => import('./features/books/books.module').then((m) => m.BooksModule),
    data: { animation: 'Books' },
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard],
    data: { animation: 'CartPage' },
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard],
    data: { animation: 'CheckoutPage' },
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.module').then((m) => m.OrdersModule),
    canActivate: [AuthGuard],
    data: { animation: 'Orders' },
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    data: { animation: 'CategoriesPage' },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { animation: 'NotFoundPage' },
  },
];

export const routes = appRoutes;
