import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactButton } from './components/contact-button';
import { Footer } from './components/footer';
import { Header } from './components/header';

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, ContactButton, Footer],
  template: `
    @if (!isAdmin()) {
      <app-header />
    }
    <main>
      <router-outlet />
    </main>
    @if (!isAdmin()) {
      <app-footer />
      <app-contact-button />
    }
  `,
})
export class App {
  private readonly router = inject(Router);

  /** Panel kendi düzenini kullanır; sitenin header'ı orada görünmez. */
  protected readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin'))
    ),
    { initialValue: false }
  );
}
