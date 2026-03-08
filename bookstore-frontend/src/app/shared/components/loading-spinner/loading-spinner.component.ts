import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type SpinnerSize = 'small' | 'medium' | 'large';

const SIZE_PX: Record<SpinnerSize, number> = {
  small: 24,
  medium: 48,
  large: 72,
};

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    @if (overlay) {
      <div class="spinner-overlay" role="status" aria-label="Loading">
        <div
          class="spinner"
          [style.width.px]="sizePx"
          [style.height.px]="sizePx"
        ></div>
      </div>
    } @else {
      <div
        class="spinner spinner-inline"
        role="status"
        aria-label="Loading"
        [style.width.px]="sizePx"
        [style.height.px]="sizePx"
      ></div>
    }
  `,
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() overlay = false;

  get sizePx(): number {
    return SIZE_PX[this.size];
  }
}
