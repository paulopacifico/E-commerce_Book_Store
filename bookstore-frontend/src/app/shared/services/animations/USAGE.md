## Shared animations (Phase 1)

All triggers are defined in `shared/services/animations/animations.service.ts`.

### 1) Import the triggers into a component

```ts
import { Component } from '@angular/core';
import { AnimationsService } from '../../shared/services/animations/animations.service';

@Component({
  // ...
  animations: [
    // Use the shared triggers (no inline imports inside templates)
    // NOTE: triggers are instance properties, so reference them from the injected service:
    // - animations.pageTransition, animations.fadeInOut, etc.
  ],
})
export class ExampleComponent {
  constructor(public readonly animations: AnimationsService) {}
}
```

Then in the decorator:

```ts
@Component({
  // ...
  animations: [
    // page / route container
    inject(AnimationsService).pageTransition,
    // elements
    inject(AnimationsService).fadeInOut,
    inject(AnimationsService).slideInOut,
    inject(AnimationsService).scaleInOut,
    // lists
    inject(AnimationsService).listStagger,
    // modals
    inject(AnimationsService).modalPanel,
    inject(AnimationsService).modalBackdrop,
  ],
})
```

### 2) Bind with motion params

Each trigger expects params. Use:

```ts
public readonly motion = this.animations.motionParams('standard');
```

And bind:

```html
<section [@fadeInOut]="{ value: 'in', params: motion }">...</section>
```

### 3) Recommended patterns

- **Page transitions**: wrap your `router-outlet` in a container div and bind `[@pageTransition]` to a route key (url, route config path, etc.).
- **List reveal**: put `[@listStagger]` on the list container; items will animate on enter.
- **Modal**: animate backdrop with `modalBackdrop` and panel/content with `modalPanel`.

### 4) Performance checklist (Phase 1)

- **GPU-friendly**: only `opacity` + `transform` are used in triggers.
- **Avoid layout thrash**: no animated `height/width/top/left`.
- **will-change**: opt-in via `.will-change-transform-opacity` only on frequently-animated elements.
- **Reduced motion**: global `prefers-reduced-motion` override is in `src/styles.scss`, and `AnimationsService.motionParams()` collapses motion at runtime.

