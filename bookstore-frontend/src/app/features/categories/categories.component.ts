import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import type { Category } from '../../core/models/category.interface';

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
