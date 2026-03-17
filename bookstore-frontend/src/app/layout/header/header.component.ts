import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../features/auth/data-access/auth.service';
import { CartStateService } from '../../features/cart/data-access/cart-state.service';

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
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly isAuthenticated$ = this.authService.isAuthenticated$;
  readonly cartCount$ = this.cartStateService.cartCount$;
  readonly mobileMenuOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly isMobile = signal(false);
  readonly searchQuery = signal('');
  readonly showNavLinks = computed(() => !this.isMobile() || this.mobileMenuOpen());

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 768px)').subscribe((state) => {
      this.isMobile.set(state.matches);
      if (!state.matches) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu(): void {
    this.closeUserMenu();
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.closeUserMenu();
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
    this.closeUserMenu();
  }

  onUserMenuTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.openUserMenuAndFocus(0);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.openUserMenuAndFocus(-1);
    }
  }

  onUserMenuListKeydown(event: KeyboardEvent): void {
    const items = this.getUserMenuItems();
    if (!items.length) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeUserMenu();
        this.focusUserMenuTrigger();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && !this.hostElement.nativeElement.contains(target)) {
      this.closeMobileMenu();
      this.closeUserMenu();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    const hadUserMenuOpen = this.userMenuOpen();
    const hadMobileMenuOpen = this.mobileMenuOpen();
    this.closeUserMenu();
    this.closeMobileMenu();

    if (hadUserMenuOpen) {
      this.focusUserMenuTrigger();
    } else if (hadMobileMenuOpen) {
      this.focusHamburgerButton();
    }
  }

  private openUserMenuAndFocus(index: number): void {
    if (!this.userMenuOpen()) {
      this.userMenuOpen.set(true);
    }
    setTimeout(() => {
      const items = this.getUserMenuItems();
      if (!items.length) return;
      const targetIndex = index < 0 ? items.length - 1 : index;
      items[targetIndex]?.focus();
    });
  }

  private getUserMenuItems(): HTMLElement[] {
    return Array.from(
      this.hostElement.nativeElement.querySelectorAll('[data-user-menu-item]'),
    ) as HTMLElement[];
  }

  private focusUserMenuTrigger(): void {
    (
      this.hostElement.nativeElement.querySelector('[data-user-menu-trigger]') as HTMLElement | null
    )?.focus();
  }

  private focusHamburgerButton(): void {
    (
      this.hostElement.nativeElement.querySelector(
        '[data-mobile-menu-trigger]',
      ) as HTMLElement | null
    )?.focus();
  }
}
