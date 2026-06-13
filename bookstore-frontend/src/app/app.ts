import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { AnimationsService, pageTransition } from './shared/services/animations/animations.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [pageTransition],
})
export class AppComponent implements OnInit {
  isNavigating = false;

  constructor(private readonly router: Router) {}

  private readonly animations = inject(AnimationsService);
  private readonly destroyRef = inject(DestroyRef);
  readonly motion = this.animations.motionParams('standard');

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationError ||
            e instanceof NavigationCancel ||
            e instanceof NavigationSkipped,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.isNavigating = e instanceof NavigationStart;
      });
  }

  prepareRoute(outlet: RouterOutlet | null | undefined): string {
    if (!outlet?.isActivated) {
      return 'App';
    }
    return (
      (outlet.activatedRouteData?.['animation'] as string | undefined) ??
      outlet.activatedRoute.snapshot.routeConfig?.path ??
      'App'
    );
  }
}
