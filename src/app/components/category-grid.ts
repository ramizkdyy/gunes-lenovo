import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppImage } from '../api/app-image';
import { ContentService } from '../api/content.service';

/**
 * Kategori kartları. Hem ana sayfadaki "Ürünler" bölümünde hem de
 * /kategoriler sayfasında kullanılıyor; karta tıklayınca o kategorinin
 * ürünleri kategori detay sayfasında listeleniyor.
 */
@Component({
  selector: 'app-category-grid',
  imports: [AsyncPipe, RouterLink, AppImage],
  template: `
    @if (categories$ | async; as categories) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (cat of categories; track cat.slug) {
          <a
            [routerLink]="['/kategoriler', cat.slug]"
            class="group flex flex-col rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6 transition-shadow hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
          >
            <app-image
              [id]="cat.imageId"
              [width]="460"
              [alt]="cat.name"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              imgClass="h-40 w-full object-contain"
            />
            <h3 class="mt-5 text-[18px] font-semibold group-hover:text-[var(--color-brand-500)]">
              {{ cat.name }}
            </h3>
            @if (cat.families) {
              <p class="mt-1 text-[13px] text-[var(--fg-soft)]">{{ cat.families }}</p>
            }
            <p class="mt-3 text-[14.5px] leading-[1.65] text-[var(--fg-soft)]">{{ cat.desc }}</p>
            <span class="mt-5 text-[14px] font-semibold text-[var(--color-brand-500)]">
              Ürünleri görün →
            </span>
          </a>
        }
      </div>
    } @else {
      <p class="text-[var(--fg-soft)]">Yükleniyor…</p>
    }
  `,
})
export class CategoryGrid {
  private readonly content = inject(ContentService);

  protected readonly categories$ = this.content.categories();
}
