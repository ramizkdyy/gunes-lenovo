import { Component, inject } from '@angular/core';
import { CategoryGrid } from '../components/category-grid';
import { Hero } from '../components/hero';

/**
 * Ana sayfa: tam ekran hero panelleri, hemen altında ürün kategorileri.
 * Kategoriye tıklayan ziyaretçi ürün listesini kategori detay sayfasında görür.
 */
@Component({
  selector: 'app-home',
  imports: [Hero, CategoryGrid],
  template: `
    <app-hero />

    <section id="urunler" class="relative z-10 bg-white">
      <div class="mx-auto w-full max-w-[1200px] px-4 py-24 sm:px-6">
        <p class="kicker">Ürünler</p>
        <h2 class="display mt-3 max-w-[20ch] text-[clamp(1.8rem,3.6vw,2.6rem)] text-balance">
          İş yükünüze göre sunucu kategorisi
        </h2>
        <p class="mt-4 max-w-[52ch] text-[16px] leading-[1.7] text-[var(--fg-soft)]">
          Kategoriyi seçin, içindeki modelleri teknik özellikleriyle karşılaştırın.
        </p>

        <div class="mt-12">
          <app-category-grid />
        </div>
      </div>
    </section>
  `,
})
export class Home {
}
