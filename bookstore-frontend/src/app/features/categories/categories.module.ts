import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { categoriesRoutes } from './categories.routes';
import { CategoriesComponent } from './pages/categories/categories.component';

@NgModule({
  declarations: [CategoriesComponent],
  imports: [CommonModule, RouterModule.forChild(categoriesRoutes)],
})
export class CategoriesModule {}
