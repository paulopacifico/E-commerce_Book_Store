import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SmoothScrollService } from './smooth-scroll.service';

describe('SmoothScrollService', () => {
  let service: SmoothScrollService;
  let nextFrameId: number;
  let frameCallbacks: Map<number, FrameRequestCallback>;
  let reducedMotion: boolean;
  let originalScrollY: PropertyDescriptor | undefined;

  beforeEach(() => {
    nextFrameId = 0;
    frameCallbacks = new Map<number, FrameRequestCallback>();
    reducedMotion = false;
    originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: reducedMotion }) as MediaQueryList),
    );
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        const id = ++nextFrameId;
        frameCallbacks.set(id, callback);
        return id;
      }),
    );
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((id: number) => {
        frameCallbacks.delete(id);
      }),
    );
    vi.spyOn(performance, 'now').mockReturnValue(0);

    TestBed.configureTestingModule({});
    service = TestBed.inject(SmoothScrollService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    }
  });

  it('cancels an active animation before an immediate scroll', () => {
    service.smoothScrollToY(500, { durationMs: 1000 });
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    service.smoothScrollToY(100, { durationMs: 0 });

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 100);
  });

  it('ignores a stale animation callback after reduced motion takes over', () => {
    service.smoothScrollToY(500, { durationMs: 1000 });
    const staleFrame = frameCallbacks.get(1);
    expect(staleFrame).toBeDefined();

    reducedMotion = true;
    service.smoothScrollToY(120, { durationMs: 1000 });
    staleFrame?.(500);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 120);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
