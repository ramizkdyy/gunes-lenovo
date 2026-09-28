import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactService } from '../api/contact.service';
import { ContentService } from '../api/content.service';

/**
 * Site altlığı. Kategori bağlantıları CMS'ten geliyor; kategori
 * eklendiğinde footer da kendiliğinden güncelleniyor.
 */
@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, RouterLink],
  template: `
    <footer class="relative z-10 border-t border-white/10 bg-[var(--color-ink)] text-white">
      <div class="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6">
        <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img
              src="img/lenovo-thinksystem-white.png"
              alt="Lenovo ThinkSystem"
              width="189"
              height="92"
              class="h-[34px] w-auto"
              loading="lazy"
            />
            <p class="mt-5 max-w-[34ch] text-[14.5px] leading-[1.7] text-white/60">
              Lenovo yetkili iş ortağı. Sunucu tedariki, kurulum ve satış sonrası destek.
            </p>
          </div>

          <nav>
            <h2 class="text-[13px] font-semibold tracking-wide text-white/50 uppercase">
              Kategoriler
            </h2>
            <ul class="mt-4 space-y-2.5">
              @for (category of categories$ | async; track category.slug) {
                <li>
                  <a
                    [routerLink]="['/kategoriler', category.slug]"
                    class="text-[14.5px] text-white/70 transition-colors hover:text-white"
                  >
                    {{ category.name }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          <div>
            <h2 class="text-[13px] font-semibold tracking-wide text-white/50 uppercase">
              İletişim
            </h2>
            <a
              href="tel:+903423255555"
              class="mt-4 block text-[16px] font-medium transition-colors hover:text-[var(--color-brand-400)]"
            >
              +90 342 325 55 55
            </a>
            <p class="mt-3 max-w-[28ch] text-[14px] leading-[1.6] text-white/55">
              Teklif için formu doldurmanız yeterli.
            </p>
            <button
              type="button"
              class="mt-5 rounded-md bg-[var(--color-brand-500)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
              (click)="contact.openFor()"
            >
              Teklif Al
            </button>
          </div>
        </div>

        <div class="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12.5px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {{ year }} · Tüm hakları saklıdır.</p>
          <p>Lenovo, ThinkSystem ve ThinkEdge, Lenovo'nun tescilli markalarıdır.</p>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly contact = inject(ContactService);

  protected readonly categories$ = inject(ContentService).categories();
  protected readonly year = new Date().getFullYear();
}
