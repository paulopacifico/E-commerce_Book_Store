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

type RevealPreset = 'subtle' | 'standard';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: RevealPreset = 'subtle';
  @Input() revealOnce = true;
  @Input() revealRootMargin = '0px 0px -12% 0px';

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(AnimationsService);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    this.renderer.addClass(node, 'reveal');
    this.renderer.addClass(node, `reveal-${this.appReveal}`);

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
          if (this.revealOnce) this.observer?.disconnect();
        });
      },
      { root: null, threshold: 0.15, rootMargin: this.revealRootMargin },
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
