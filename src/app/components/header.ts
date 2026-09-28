import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactService } from '../api/contact.service';

/**
 * Siyah, sabit header. Marka olarak yalnızca Lenovo ThinkSystem logosu
 * duruyor; site Lenovo ürünlerini öne çıkarıyor.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--color-ink)]">
      <div class="mx-auto flex h-20 max-w-[1200px] items-center gap-10 px-4 sm:px-6">
        <a routerLink="/" class="shrink-0" aria-label="Ana sayfa">
          <img
            src="img/lenovo-thinksystem-white.png"
            alt="Lenovo ThinkSystem"
            width="189"
            height="92"
            class="h-[34px] w-auto"
          />
        </a>

        <nav class="hidden items-center gap-7 md:flex">
          @for (link of links; track link.href) {
            <a
              [routerLink]="link.href"
              [fragment]="link.fragment"
              class="text-[14px] font-medium text-white/65 transition-colors hover:text-white"
            >
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="ml-auto flex items-center gap-3">

          <a
            href="tel:+903423255555"
            class="hidden text-[14px] font-medium text-white/65 transition-colors hover:text-white lg:inline"
          >
            +90 342 325 55 55
          </a>
          <button
            type="button"
            class="rounded-md bg-[var(--color-brand-500)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
            (click)="contact.openFor()"
          >
            Teklif Al
          </button>

          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-md text-white/80 md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-label="Menü"
            (click)="menuOpen.set(!menuOpen())"
          >
            <span class="relative block h-[14px] w-[20px]">
              <span
                class="absolute left-0 h-[2px] w-full bg-current transition-transform"
                [class]="menuOpen() ? 'top-[6px] rotate-45' : 'top-0'"
              ></span>
              <span
                class="absolute left-0 h-[2px] w-full bg-current transition-transform"
                [class]="menuOpen() ? 'top-[6px] -rotate-45' : 'top-[12px]'"
              ></span>
            </span>
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav class="border-t border-white/10 px-4 py-3 md:hidden">
          @for (link of links; track link.href) {
            <a
              [routerLink]="link.href"
              [fragment]="link.fragment"
              (click)="menuOpen.set(false)"
              class="block py-2 text-[15px] font-medium text-white/75"
            >
              {{ link.label }}
            </a>
          }
        </nav>
      }
    </header>
  `,
})
export class Header {
  protected readonly contact = inject(ContactService);
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { href: '/', label: 'Ürünler', fragment: 'urunler' },
  ] as const;
}
