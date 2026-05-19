import { Routes } from '@angular/router';

import { CategoriesComponent } from './pages/categories/categories.component';

export const categoriesRoutes: Routes = [
  { path: '', component: CategoriesComponent, data: { animation: 'CategoriesPage' } },
];
