import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  isNavigating = false;
  private sub: Subscription | null = null;

  constructor(private readonly router: Router) {}

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
}
