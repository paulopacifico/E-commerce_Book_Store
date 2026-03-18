import { Injectable } from '@angular/core';

export type SmoothScrollEasing = 'inertia' | 'easeInOutCubic';

export interface SmoothScrollToOptions {
  durationMs?: number;
  easing?: SmoothScrollEasing;
  offsetPx?: number;
}

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private activeRafId: number | null = null;
  private animationToken = 0;

  get prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }

  getHeaderOffsetPx(): number {
    if (typeof document === 'undefined') return 0;
    const header = document.querySelector('.header-toolbar') as HTMLElement | null;
    return header?.getBoundingClientRect().height ?? 0;
  }

  scrollToTop(durationMs = 520): void {
    this.smoothScrollToY(0, { durationMs, easing: 'inertia' });
  }

  scrollToElement(element: HTMLElement, options: SmoothScrollToOptions = {}): void {
    const offsetPx = options.offsetPx ?? this.getHeaderOffsetPx();
    const top = element.getBoundingClientRect().top + window.scrollY - offsetPx;
    this.smoothScrollToY(top, options);
  }

  scrollToElementId(id: string, options: SmoothScrollToOptions = {}): void {
    const el = document.getElementById(id);
    if (!el) return;
    this.scrollToElement(el, options);
  }

  scrollToAnchor(hash: string, options: SmoothScrollToOptions = {}): void {
    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;
    this.scrollToElementId(id, options);
  }

  smoothScrollToY(targetY: number, options: SmoothScrollToOptions = {}): void {
    if (typeof window === 'undefined') return;

    const durationMs = options.durationMs ?? 800;
    const easing = options.easing ?? 'inertia';

    if (this.prefersReducedMotion || durationMs <= 0) {
      window.scrollTo(0, Math.round(targetY));
      return;
    }

    if (this.activeRafId != null) {
      cancelAnimationFrame(this.activeRafId);
      this.activeRafId = null;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) return;

    const token = ++this.animationToken;
    const startTime = performance.now();

    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    // "Inertia" curve (momentum-like): asymptotically approaches the target.
    // k chosen so the scroll essentially completes near durationMs.
    const k = 8 / durationMs;

    const step = (now: number): void => {
      if (token !== this.animationToken) return;

      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);

      const progress = easing === 'inertia' ? 1 - Math.exp(-k * elapsed) : easeInOutCubic(t);
      const nextY = startY + distance * Math.max(0, Math.min(1, progress));

      window.scrollTo(0, nextY);

      if (t < 1) {
        this.activeRafId = requestAnimationFrame(step);
      } else {
        this.activeRafId = null;
      }
    };

    this.activeRafId = requestAnimationFrame(step);
  }
}
