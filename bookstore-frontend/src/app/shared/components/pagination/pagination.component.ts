import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';

export type PageItem = number | 'ellipsis';

const MAX_VISIBLE_PAGES = 7;

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() set currentPage(value: number) {
    this.currentPageSignal.set(value);
  }
  @Input() set totalPages(value: number) {
    this.totalPagesSignal.set(value);
  }
  @Input() itemsPerPage = 10;

  @Output() pageChange = new EventEmitter<number>();

  protected readonly currentPageSignal = signal(0);
  protected readonly totalPagesSignal = signal(0);

  protected readonly pageItems = computed<PageItem[]>(() => {
    const current = this.currentPageSignal();
    const total = this.totalPagesSignal();
    if (total <= 0) return [];
    if (total <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const items: PageItem[] = [0];
    const lastPage = total - 1;
    const showLeftEllipsis = current > 2;
    const showRightEllipsis = current < lastPage - 2;
    if (showLeftEllipsis) items.push('ellipsis');
    const start = Math.max(1, current - 1);
    const end = Math.min(lastPage - 1, current + 1);
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    if (showRightEllipsis) items.push('ellipsis');
    if (lastPage > 0) items.push(lastPage);
    return items;
  });

  get currentPage(): number {
    return this.currentPageSignal();
  }

  get totalPages(): number {
    return this.totalPagesSignal();
  }

  protected goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.pageChange.emit(page);
  }

  protected previous(): void {
    if (this.currentPage > 0) this.pageChange.emit(this.currentPage - 1);
  }

  protected next(): void {
    if (this.currentPage < this.totalPages - 1) this.pageChange.emit(this.currentPage + 1);
  }

  protected isEllipsis(item: PageItem): item is 'ellipsis' {
    return item === 'ellipsis';
  }
}
