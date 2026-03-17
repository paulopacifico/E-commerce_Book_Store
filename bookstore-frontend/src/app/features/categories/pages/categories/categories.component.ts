import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CategoryService } from '../../data-access/category.service';
import type { Category } from '../../models/category.interface';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  private readonly categoryService = inject(CategoryService);

  readonly categories$ = this.categoryService.getCategories();
}
