import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AppImage } from '../api/app-image';
import { ContentService } from '../api/content.service';
import { specsOf } from '../api/models';
import type { Product } from '../api/models';

/**
 * Tek kategori ve içindeki ürünler. Kartlar Lenovo'nun kendi ürün
 * listelerindeki gibi: her üründe aynı özellik başlıkları, aynı sırada —
 * böylece modeller göz ucuyla karşılaştırılabiliyor.
 */
@Component({
  selector: 'app-category-detail',
  imports: [AsyncPipe, RouterLink, AppImage],
  template: `
    @if (category$ | async; as cat) {
      <section class="mx-auto w-full max-w-[1200px] px-4 pt-32 pb-24 sm:px-6">
        <a
          routerLink="/"
          fragment="urunler"
          class="text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]"
        >
          ← Tüm kategoriler
        </a>

        <div class="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            @if (cat.families) {
              <p class="kicker">{{ cat.families }}</p>
            }
            <h1 class="display mt-3 text-[clamp(1.9rem,4vw,3rem)] text-balance">{{ cat.name }}</h1>
            <p class="mt-5 max-w-[56ch] text-[16px] leading-[1.7] text-[var(--fg-soft)]">{{ cat.desc }}</p>
          </div>
          <app-image
            [id]="cat.imageId"
            [width]="380"
            [alt]="cat.name"
            imgClass="h-auto w-full max-w-[380px]"
          />
        </div>

        @if (cat.products?.length) {
          <h2 class="mt-16 text-[20px] font-semibold">Modeller</h2>

          <div class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (p of cat.products; track p.slug) {
              <article
                class="flex flex-col rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6"
              >
                <h3 class="text-[17px] font-semibold text-[var(--color-brand-500)]">{{ p.model }}</h3>

                <app-image
                  [id]="p.imageId"
                  [width]="400"
                  [alt]="p.model"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  imgClass="mt-5 h-36 w-full object-contain"
                />

                <p class="mt-5 text-[14.5px] leading-[1.6] text-[var(--fg-soft)]">{{ p.title }}</p>

                <!-- Sabit özellik satırları: her kartta aynı başlıklar, aynı sıra -->
                <ul class="mt-5 space-y-2 text-[14px] leading-[1.55]">
                  @for (spec of specs(p); track spec.label) {
                    <li class="flex gap-1.5">
                      <span class="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--color-n-400)]"></span>
                      <span>
                        <span class="font-semibold">{{ spec.label }}:</span>
                        <span class="text-[var(--fg-soft)]"> {{ spec.value }}</span>
                      </span>
                    </li>
                  }
                </ul>

                <div class="mt-auto pt-7">
                  <a
                    [routerLink]="['/kategoriler', cat.slug, p.slug]"
                    class="block rounded-md bg-[var(--color-brand-500)] px-5 py-3 text-center text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
                  >
                    Daha fazla bilgi
                  </a>
                </div>
              </article>
            }
          </div>
        } @else {
          <h2 class="mt-16 text-[20px] font-semibold">Modeller</h2>
          <p class="mt-4 text-[var(--fg-soft)]">Bu kategoriye henüz ürün eklenmedi. İhtiyacınızı yazın, uygun modelle dönelim.</p>
        }
      </section>
    } @else {
      <section class="mx-auto max-w-[1200px] px-4 pt-32 pb-24 sm:px-6">
        <p class="text-[var(--fg-soft)]">Yükleniyor…</p>
      </section>
    }
  `,
})
export class CategoryDetail {
  /** Rotadan gelir: /kategoriler/:slug */
  readonly slug = input.required<string>();

  private readonly content = inject(ContentService);

  protected readonly category$ = toObservable(this.slug).pipe(
    switchMap((slug) => this.content.category(slug).pipe(catchError(() => of(null))))
  );
  protected specs = (product: Product) => specsOf(product);
}
