import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from './admin.service';

/** Özet ekranı: ne kadar içerik var, eksik kalan ne. */
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <div class="mx-auto w-full max-w-[1000px] px-6 py-10">
      <h1 class="text-[22px] font-semibold">Özet</h1>

      @if (loading()) {
        <p class="mt-8 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else {
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (card of cards(); track card.path) {
            <a
              [routerLink]="card.path"
              class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5 transition-colors hover:border-[var(--fg-soft)]"
            >
              <p class="text-[13px] text-[var(--fg-soft)]">{{ card.label }}</p>
              <p class="mt-1.5 text-[26px] font-semibold">{{ card.count }}</p>
              <p class="mt-1 text-[12.5px] text-[var(--fg-soft)]">{{ card.note }}</p>
            </a>
          }
        </div>

        @if (warnings().length) {
          <section class="mt-8 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-5">
            <h2 class="text-[15px] font-semibold">Dikkat edilecekler</h2>
            <ul class="mt-3 space-y-2">
              @for (warning of warnings(); track warning) {
                <li class="flex gap-2 text-[14px] text-[var(--fg-soft)]">
                  <span class="mt-[7px] size-1 shrink-0 rounded-full bg-[var(--color-brand-500)]"></span>
                  <span>{{ warning }}</span>
                </li>
              }
            </ul>
          </section>
        }
      }
    </div>
  `,
})
export class AdminDashboard {
  private readonly admin = inject(AdminService);

  protected readonly loading = signal(true);
  protected readonly cards = signal<{ label: string; count: number; note: string; path: string }[]>([]);
  protected readonly warnings = signal<string[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const [categories, products, slides, unread] = await Promise.all([
      this.admin.categories(),
      this.admin.products(),
      this.admin.heroSlides(),
      this.admin.unreadCount(),
    ]);

    const published = <T extends { status: string }>(items: T[]) =>
      items.filter((item) => item.status === 'PUBLISHED').length;

    this.cards.set([
      {
        label: 'Okunmamış mesaj',
        count: unread.count,
        note: unread.count ? 'yanıt bekliyor' : 'hepsi okundu',
        path: '/admin/mesajlar',
      },
      {
        label: 'Kategoriler',
        count: categories.length,
        note: `${published(categories)} tanesi yayında`,
        path: '/admin/kategoriler',
      },
      {
        label: 'Ürünler',
        count: products.length,
        note: `${published(products)} tanesi yayında`,
        path: '/admin/urunler',
      },
      {
        label: 'Ana sayfa panelleri',
        count: slides.length,
        note: `${published(slides)} tanesi yayında`,
        path: '/admin/hero',
      },
    ]);

    const missingImage = products.filter((p) => !p.imageId).length;
    const waiting = unread.count;
    const emptyCategories = categories.filter((c) => (c._count?.products ?? 0) === 0).length;
    const draftProducts = products.length - published(products);

    this.warnings.set(
      [
        waiting ? `${waiting} mesaj yanıt bekliyor.` : '',
        missingImage ? `${missingImage} üründe görsel yok, yer tutucu görünüyor.` : '',
        emptyCategories ? `${emptyCategories} kategori boş, içine ürün eklenmemiş.` : '',
        draftProducts ? `${draftProducts} ürün taslak durumda, sitede görünmüyor.` : '',
      ].filter(Boolean)
    );

    this.loading.set(false);
  }
}
