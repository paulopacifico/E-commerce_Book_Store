import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { AnimationsService } from '../services/animations/animations.service';

type TitleRevealPreset = 'subtle' | 'standard';

@Directive({
  selector: '[appTitleReveal]',
  standalone: true,
})
export class TitleRevealDirective implements AfterViewInit, OnDestroy {
  @Input() titlePreset: TitleRevealPreset = 'standard';
  @Input() titleOnce = true;
  @Input() titleRootMargin = '0px 0px -18% 0px';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(AnimationsService);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    const original = node.textContent ?? '';

    this.renderer.addClass(node, 'title-reveal');
    this.renderer.addClass(node, `title-reveal-${this.titlePreset}`);
    this.wrapWords(node, original);

    if (this.motion.prefersReducedMotion) {
      this.renderer.addClass(node, 'is-revealed');
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(node, 'is-revealed');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.renderer.addClass(node, 'is-revealed');
          if (this.titleOnce) this.observer?.disconnect();
        });
      },
      { root: null, threshold: 0.25, rootMargin: this.titleRootMargin },
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private wrapWords(node: HTMLElement, text: string): void {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return;

    while (node.firstChild) node.removeChild(node.firstChild);

    const words = cleaned.split(' ');
    words.forEach((word, idx) => {
      const span = this.renderer.createElement('span') as HTMLSpanElement;
      this.renderer.addClass(span, 'title-word');
      this.renderer.setProperty(span, 'textContent', word);
      this.renderer.setStyle(span, '--word-index', String(idx));
      node.appendChild(span);

      if (idx !== words.length - 1) {
        node.appendChild(this.renderer.createText(' '));
      }
    });
  }
}
