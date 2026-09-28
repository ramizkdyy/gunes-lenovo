import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { AppImage } from '../api/app-image';
import { ContactService } from '../api/contact.service';
import { ContentService } from '../api/content.service';
import { specsOf } from '../api/models';
import type { Product } from '../api/models';

/** Tek ürün: görsel, açıklama, teknik özellik tablosu. */
@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, RouterLink, AppImage],
  template: `
    @if (product$ | async; as p) {
      <section class="mx-auto w-full max-w-[1200px] px-4 pt-32 pb-24 sm:px-6">
        <a [routerLink]="['/kategoriler', categorySlug()]" class="text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]">
          ← {{ p.category?.name ?? 'Kategori' }}
        </a>

        <div class="mt-6 grid gap-12 lg:grid-cols-2">
          <app-image
            [id]="p.imageId"
            [width]="600"
            [alt]="p.model"
            [priority]="true"
            sizes="(min-width: 1024px) 50vw, 100vw"
            imgClass="h-auto w-full"
          />

          <div>
            <h1 class="display text-[clamp(1.7rem,3.2vw,2.5rem)] text-balance">{{ p.model }}</h1>
            <p class="mt-3 text-[17px] text-[var(--fg-soft)]">{{ p.title }}</p>
            <p class="mt-5 max-w-[52ch] text-[16px] leading-[1.7]">{{ p.desc }}</p>

            @if (specs(p).length) {
              <dl class="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                @for (spec of specs(p); track spec.label) {
                  <div class="flex gap-6 py-3.5">
                    <dt class="w-44 shrink-0 text-[14px] text-[var(--fg-soft)]">{{ spec.label }}</dt>
                    <dd class="text-[14.5px] leading-[1.6]">{{ spec.value }}</dd>
                  </div>
                }
              </dl>
            }

            <div class="mt-9 flex flex-wrap gap-3">
              <!-- Form bu ürünle açılır; ziyaretçi modeli tekrar yazmaz. -->
              <button
                type="button"
                class="rounded-md bg-[var(--color-brand-500)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
                (click)="askFor(p)"
              >
                Bu ürün için teklif alın
              </button>
              @if (p.datasheetUrl) {
                <a
                  [href]="p.datasheetUrl"
                  target="_blank"
                  rel="noopener"
                  class="rounded-md border border-[var(--line)] px-6 py-3 text-[15px] font-medium transition-colors hover:border-[var(--fg)]"
                >
                  Teknik döküman
                </a>
              }
            </div>
          </div>
        </div>
      </section>
    } @else {
      <section class="mx-auto max-w-[1200px] px-4 pt-32 pb-24 sm:px-6">
        <p class="text-[var(--fg-soft)]">Yükleniyor…</p>
      </section>
    }
  `,
})
export class ProductDetail {
  /** Rotadan gelir: /kategoriler/:categorySlug/:slug */
  readonly categorySlug = input.required<string>();
  readonly slug = input.required<string>();

  private readonly content = inject(ContentService);

  protected readonly product$ = combineLatest([
    toObservable(this.categorySlug),
    toObservable(this.slug),
  ]).pipe(
    switchMap(([category, slug]) =>
      this.content.product(category, slug).pipe(catchError(() => of(null)))
    )
  );

  protected specs = (product: Product) => specsOf(product);

  private readonly contact = inject(ContactService);

  /** İletişim formunu bu ürün seçili gelecek şekilde açar. */
  protected askFor(product: Product): void {
    this.contact.openFor({ id: product.id, model: product.model });
  }

}
