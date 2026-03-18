import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';
import { ScrollObserverService } from '../services/scroll-observer/scroll-observer.service';
import { AnimationsService } from '../services/animations/animations.service';

type RevealAnimationType =
  | 'subtle'
  | 'standard'
  | 'stagger'
  | 'slide-left'
  | 'slide-right'
  | 'slide-alternate'
  | 'scale'
  | 'counter';

type NormalizedRevealType = Exclude<RevealAnimationType, 'slide-left' | 'slide-right'>;
type NonCounterRevealType = Exclude<NormalizedRevealType, 'counter'>;

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  /**
   * Usage examples:
   * - `<section appReveal>` -> uses 'subtle'
   * - `<div appReveal="stagger">` -> staggered fade for direct children
   * - `<span appReveal="counter">10,000+</span>` -> animates numbers when visible
   */
  // Angular passes a bare attribute like `appReveal` as an empty string (`""`) in template typechecking.
  // We accept `""` and normalize it to the default preset.
  @Input() appReveal: RevealAnimationType | boolean | '' = 'subtle';
  @Input() revealOnce = true;
  @Input() revealRootMargin = '0px 0px -12% 0px';
  @Input() revealThreshold = 0.15;
  @Input() revealDisableOnMobile = true;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly motion = inject(AnimationsService);
  private readonly scrollObserver = inject(ScrollObserverService);
  private observer: IntersectionObserver | null = null;
  private counterRafId: number | null = null;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;

    const normalized = this.normalizeType(this.appReveal);

    if (!this.shouldAnimate()) {
      this.applyImmediate(node, normalized);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.applyImmediate(node, normalized);
      return;
    }

    if (normalized === 'counter') {
      this.startCounterWhenVisible(node);
      return;
    }

    this.applySetupClasses(node, normalized);

    this.observer = this.scrollObserver.observe(
      node,
      (entry) => {
        if (!entry.isIntersecting) return;
        this.renderer.addClass(node, 'is-revealed');
        if (this.revealOnce) this.observer?.disconnect();
      },
      { root: null, threshold: this.revealThreshold, rootMargin: this.revealRootMargin },
    );
  }

  private normalizeType(input: RevealAnimationType | boolean | ''): NormalizedRevealType {
    if (input === '' || input === true || input === false) return 'subtle';

    switch (input) {
      case 'subtle':
      case 'standard':
      case 'stagger':
      case 'scale':
      case 'slide-alternate':
      case 'counter':
        return input;
      case 'slide-left':
        return 'slide-alternate';
      case 'slide-right':
        return 'slide-alternate';
      default: {
        const _exhaustive: never = input;
        return _exhaustive;
      }
    }
  }

  private shouldAnimate(): boolean {
    if (this.motion.prefersReducedMotion) return false;
    if (!this.revealDisableOnMobile) return true;

    const width =
      typeof window !== 'undefined' && typeof window.innerWidth === 'number'
        ? window.innerWidth
        : 9999;
    return width >= 640;
  }

  private applyImmediate(node: HTMLElement, normalized: NormalizedRevealType): void {
    if (normalized === 'counter') {
      this.runCounter(node);
      this.renderer.addClass(node, 'is-revealed');
      return;
    }

    this.applySetupClasses(node, normalized);
    this.renderer.addClass(node, 'is-revealed');
  }

  private applySetupClasses(node: HTMLElement, normalized: NonCounterRevealType): void {
    // Base reveal styles (opacity/transform). Counter uses its own behavior.
    this.renderer.addClass(node, 'reveal');

    if (normalized === 'subtle') {
      this.renderer.addClass(node, 'reveal-subtle');
      return;
    }
    if (normalized === 'standard') {
      this.renderer.addClass(node, 'reveal-standard');
      return;
    }

    switch (normalized) {
      case 'stagger':
        this.renderer.addClass(node, 'reveal-type-stagger');
        this.setupStaggerChildren(node);
        return;
      case 'slide-alternate':
        this.renderer.addClass(node, 'reveal-type-slide-alternate');
        this.setupAlternateChildren(node);
        return;
      case 'scale':
        this.renderer.addClass(node, 'reveal-type-scale');
        return;
      default: {
        const _exhaustive: never = normalized;
        return _exhaustive;
      }
    }
  }

  private setupStaggerChildren(container: HTMLElement): void {
    const children = Array.from(container.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement,
    );
    children.forEach((child, index) => {
      this.renderer.addClass(child, 'sr-stagger-item');
      this.renderer.setStyle(child, '--sr-stagger-delay-ms', `${index * 55}ms`);
    });
  }

  private setupAlternateChildren(container: HTMLElement): void {
    const children = Array.from(container.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement,
    );
    children.forEach((child, index) => {
      this.renderer.addClass(child, 'sr-alternate-item');
      const dir = index % 2 === 0 ? -1 : 1;
      this.renderer.setStyle(child, '--sr-alt-x', `${dir * 18}px`);
    });
  }

  private startCounterWhenVisible(node: HTMLElement): void {
    this.observer = this.scrollObserver.observe(
      node,
      (entry) => {
        if (!entry.isIntersecting) return;
        this.runCounter(node);
        this.renderer.addClass(node, 'is-revealed');
        if (this.revealOnce) this.observer?.disconnect();
      },
      { root: null, threshold: this.revealThreshold, rootMargin: this.revealRootMargin },
    );
  }

  private runCounter(node: HTMLElement): void {
    const original = (node.textContent ?? '').trim();
    const match = original.match(/([\d.,]+)\s*([^\d]*)$/);
    if (!match) return;

    const rawNumber = match[1].replace(/,/g, '');
    const suffix = match[2] ?? '';
    const target = Number(rawNumber);
    if (!Number.isFinite(target)) return;

    // Reduced motion or tiny devices: snap immediately.
    if (!this.shouldAnimate()) {
      node.textContent = `${this.formatNumber(target)}${suffix}`;
      return;
    }

    if (this.counterRafId != null) cancelAnimationFrame(this.counterRafId);

    const durationMs = 900;
    const start = performance.now();

    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      node.textContent = `${this.formatNumber(current)}${suffix}`;

      if (t < 1) {
        this.counterRafId = requestAnimationFrame(tick);
      }
    };

    this.counterRafId = requestAnimationFrame(tick);
  }

  private formatNumber(value: number): string {
    // Keep it lightweight: compact formatting isn't always stable for UX.
    return new Intl.NumberFormat('en-US').format(value);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.counterRafId != null) cancelAnimationFrame(this.counterRafId);
    this.counterRafId = null;
  }
}
