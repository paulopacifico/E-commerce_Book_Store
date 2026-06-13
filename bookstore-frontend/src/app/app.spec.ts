import { TestBed } from '@angular/core/testing';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  Router,
  type Event as RouterEvent,
} from '@angular/router';
import type { Subject } from 'rxjs';

import { AppComponent } from './app';
import { AppModule } from './app.module';

describe('AppComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-layout')).not.toBeNull();
    expect(compiled.querySelector('main.main-content')).not.toBeNull();
  });

  it('should keep the global loading bar hidden before navigation starts', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.global-loading')).toBeNull();
  });

  it('should stop the loading state when navigation is canceled', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    emitRouterEvent(new NavigationStart(1, '/checkout'));
    expect(app.isNavigating).toBe(true);

    emitRouterEvent(
      new NavigationCancel(
        1,
        '/checkout',
        'Authentication required',
        NavigationCancellationCode.GuardRejected,
      ),
    );

    expect(app.isNavigating).toBe(false);
  });

  it('should stop the loading state when navigation is skipped', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    emitRouterEvent(new NavigationStart(2, '/books'));
    emitRouterEvent(
      new NavigationSkipped(
        2,
        '/books',
        'Same URL navigation ignored',
        NavigationSkippedCode.IgnoredSameUrlNavigation,
      ),
    );

    expect(app.isNavigating).toBe(false);
  });

  it('should stop reacting to router events after destruction', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    fixture.destroy();

    emitRouterEvent(new NavigationStart(3, '/cart'));

    expect(app.isNavigating).toBe(false);
  });

  function emitRouterEvent(event: RouterEvent): void {
    (router.events as Subject<RouterEvent>).next(event);
  }
});
