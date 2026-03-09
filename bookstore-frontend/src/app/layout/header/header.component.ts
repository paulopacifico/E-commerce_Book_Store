import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';
import { CartStateService } from '../../core/services/cart-state.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly cartStateService = inject(CartStateService);

  readonly isAuthenticated$ = this.authService.isAuthenticated$;
  readonly cartCount$ = this.cartStateService.cartCount$;
  readonly mobileMenuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly isMobile = signal(false);
  readonly searchQuery = signal('');
  readonly showNavLinks = computed(() => !this.isMobile() || this.mobileMenuOpen());

  ngOnInit(): void {
    this.authService.refreshAuthState();
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .subscribe((state) => this.isMobile.set(state.matches));
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
    this.closeMobileMenu();
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.closeMobileMenu();
    this.closeUserMenu();
    this.authService.logout();
  }

  onSearch(): void {
    const term = this.searchQuery().trim();
    this.router.navigate(['/books'], {
      queryParams: term ? { search: term } : {},
    });
    this.closeMobileMenu();
  }
}
