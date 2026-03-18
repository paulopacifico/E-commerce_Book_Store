import { Injectable } from '@angular/core';
import {
  animate,
  animateChild,
  AnimationTriggerMetadata,
  group,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

type MotionPreset = 'none' | 'subtle' | 'standard';

type MotionConfig = Readonly<{
  preset: MotionPreset;
  enterMs: number;
  exitMs: number;
  staggerMs: number;
  yPx: number;
  xPx: number;
  scaleFrom: number;
}>;

@Injectable({ providedIn: 'root' })
export class AnimationsService {
  /**
   * Use in templates to parameterize durations/offsets.
   * Example: [@pageTransition]="{ value: routeKey, params: animations.motionParams('standard') }"
   */
  motionParams(preset: MotionPreset = 'standard'): MotionConfig {
    if (this.prefersReducedMotion) {
      return {
        preset: 'none',
        enterMs: 1,
        exitMs: 1,
        staggerMs: 1,
        yPx: 0,
        xPx: 0,
        scaleFrom: 1,
      };
    }

    switch (preset) {
      case 'subtle':
        return {
          preset,
          enterMs: 180,
          exitMs: 140,
          staggerMs: 40,
          yPx: 8,
          xPx: 10,
          scaleFrom: 0.985,
        };
      case 'standard':
        return {
          preset,
          enterMs: 240,
          exitMs: 180,
          staggerMs: 55,
          yPx: 12,
          xPx: 14,
          scaleFrom: 0.98,
        };
      case 'none':
        return {
          preset,
          enterMs: 1,
          exitMs: 1,
          staggerMs: 1,
          yPx: 0,
          xPx: 0,
          scaleFrom: 1,
        };
      default: {
        const _exhaustive: never = preset;
        return _exhaustive;
      }
    }
  }

  get prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }

  /**
   * Page transitions for router outlet containers.
   * Applies to :enter/:leave and runs child animations when present.
   */
  readonly pageTransition: AnimationTriggerMetadata = trigger('pageTransition', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [style({ position: 'absolute', inset: 0 })], { optional: true }),
      query(':enter', [style({ opacity: 0, transform: 'translateY({{yPx}}px)' })], {
        optional: true,
      }),
      group([
        query(':leave', [animate('{{exitMs}}ms ease', style({ opacity: 0 }))], { optional: true }),
        query(
          ':enter',
          [animate('{{enterMs}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))],
          { optional: true },
        ),
      ]),
      query(':enter', animateChild(), { optional: true }),
    ]),
  ]);

  /** Simple fade for :enter/:leave elements. */
  readonly fadeInOut: AnimationTriggerMetadata = trigger('fadeInOut', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('{{enterMs}}ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [animate('{{exitMs}}ms ease', style({ opacity: 0 }))]),
  ]);

  /** Slide + fade for panels/drawers. Direction is encoded via xPx/yPx params. */
  readonly slideInOut: AnimationTriggerMetadata = trigger('slideInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translate3d({{xPx}}px, {{yPx}}px, 0)' }),
      animate('{{enterMs}}ms ease-out', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' })),
    ]),
    transition(':leave', [
      animate(
        '{{exitMs}}ms ease',
        style({ opacity: 0, transform: 'translate3d({{xPx}}px, {{yPx}}px, 0)' }),
      ),
    ]),
  ]);

  /** Scale + fade for dialogs/popovers. */
  readonly scaleInOut: AnimationTriggerMetadata = trigger('scaleInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale({{scaleFrom}})' }),
      animate('{{enterMs}}ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
    transition(':leave', [
      animate('{{exitMs}}ms ease', style({ opacity: 0, transform: 'scale({{scaleFrom}})' })),
    ]),
  ]);

  /**
   * Staggered list reveal. Apply on the list container.
   * Animates direct children (default selector ':enter') using opacity + translateY.
   */
  readonly listStagger: AnimationTriggerMetadata = trigger('listStagger', [
    transition(':enter, * => *', [
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY({{yPx}}px)' }),
          stagger('{{staggerMs}}ms', [
            animate('{{enterMs}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ],
        { optional: true },
      ),
    ]),
  ]);

  /**
   * Modal/dialog container motion (content panel). Pair with `modalBackdrop`.
   * Useful for custom modals or Material dialogs via panelClass wrapper.
   */
  readonly modalPanel: AnimationTriggerMetadata = trigger('modalPanel', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translate3d(0, {{yPx}}px, 0) scale({{scaleFrom}})' }),
      animate(
        '{{enterMs}}ms ease-out',
        style({ opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }),
      ),
    ]),
    transition(':leave', [
      animate(
        '{{exitMs}}ms ease',
        style({ opacity: 0, transform: 'translate3d(0, {{yPx}}px, 0) scale({{scaleFrom}})' }),
      ),
    ]),
  ]);

  /** Modal/dialog backdrop fade. */
  readonly modalBackdrop: AnimationTriggerMetadata = trigger('modalBackdrop', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('{{enterMs}}ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [animate('{{exitMs}}ms ease', style({ opacity: 0 }))]),
  ]);
}
