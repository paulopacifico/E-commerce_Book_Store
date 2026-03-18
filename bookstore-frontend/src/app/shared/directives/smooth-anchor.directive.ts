import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { SmoothScrollService } from '../services/smooth-scroll/smooth-scroll.service';

@Directive({
  selector: 'a[href^="#"][appSmoothAnchor]',
  standalone: true,
})
export class SmoothAnchorDirective {
  @Input() appSmoothAnchorOffsetPx: number | null = null;
  @Input() appSmoothAnchorDurationMs: number = 800;

  private readonly el = inject(ElementRef<HTMLAnchorElement>);
  private readonly smoothScroll = inject(SmoothScrollService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const anchor = this.el.nativeElement;
    const href = anchor.getAttribute('href') ?? '';
    if (!href.startsWith('#')) return;

    const id = href.slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();

    const offsetPx = this.appSmoothAnchorOffsetPx ?? this.smoothScroll.getHeaderOffsetPx();
    this.smoothScroll.scrollToElement(target, {
      durationMs: this.appSmoothAnchorDurationMs,
      easing: 'inertia',
      offsetPx,
    });
  }
}
