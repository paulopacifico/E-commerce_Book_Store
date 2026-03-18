import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import {
  AnimationsService,
  pageTransition,
} from './shared/services/animations/animations.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [pageTransition],
})
export class AppComponent implements OnInit, OnDestroy {
  isNavigating = false;
  private sub: Subscription | null = null;

  constructor(private readonly router: Router) {
  }

  private readonly animations = inject(AnimationsService);
  readonly motion = this.animations.motionParams('standard');

  ngOnInit(): void {
    this.sub = this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationError,
        ),
      )
      .subscribe((e) => {
        this.isNavigating = e instanceof NavigationStart;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
