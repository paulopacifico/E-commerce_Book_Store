import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../features/auth/data-access/auth.service';
import { CartFacadeService } from '../../features/cart/data-access/cart-facade.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let breakpointState$: Subject<BreakpointState>;
  let navigateMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    breakpointState$ = new Subject<BreakpointState>();
    navigateMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: vi.fn().mockReturnValue(breakpointState$.asObservable()),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isAuthenticated$: of(false),
            logout: vi.fn(),
          } as Pick<AuthService, 'isAuthenticated$' | 'logout'>,
        },
        {
          provide: CartFacadeService,
          useValue: {
            cartCount$: of(0),
          } as Pick<CartFacadeService, 'cartCount$'>,
        },
        {
          provide: Router,
          useValue: { navigate: navigateMock } as Pick<Router, 'navigate'>,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the responsive state and closes mobile menus on desktop', () => {
    breakpointState$.next({ matches: true, breakpoints: {} });
    component.toggleMobileMenu();
    component.toggleUserMenu();

    expect(component.isMobile()).toBe(true);
    expect(component.mobileMenuOpen()).toBe(true);
    expect(component.userMenuOpen()).toBe(true);

    breakpointState$.next({ matches: false, breakpoints: {} });

    expect(component.isMobile()).toBe(false);
    expect(component.mobileMenuOpen()).toBe(false);
    expect(component.userMenuOpen()).toBe(false);
  });

  it('normalizes the search term before navigating to the catalog', () => {
    const searchInput = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = '  Domain-Driven Design  ';
    searchInput.dispatchEvent(new Event('input'));

    component.onSearch();

    expect(component.searchQuery()).toBe('  Domain-Driven Design  ');
    expect(navigateMock).toHaveBeenCalledWith(['/books'], {
      queryParams: { search: 'Domain-Driven Design' },
    });
  });

  it('stops reacting to breakpoint changes after destruction', () => {
    breakpointState$.next({ matches: true, breakpoints: {} });
    expect(component.isMobile()).toBe(true);

    fixture.destroy();
    breakpointState$.next({ matches: false, breakpoints: {} });

    expect(component.isMobile()).toBe(true);
  });
});
