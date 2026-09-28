import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppImage } from '../api/app-image';
import { AdminService } from './admin.service';
import { UiConfirm, UiStatus } from './ui';
import type { Category, Product } from '../api/models';

/** Ürün listesi, kategoriye göre süzülebilir. */
@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, FormsModule, AppImage, UiStatus, UiConfirm],
  template: `
    <div class="mx-auto w-full max-w-[1000px] px-6 py-10">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-[22px] font-semibold">Ürünler</h1>
          <p class="mt-1 text-[14px] text-[var(--fg-soft)]">
            {{ filtered().length }} ürün listeleniyor.
          </p>
        </div>
        <a
          routerLink="/admin/urunler/yeni"
          class="rounded-md bg-[var(--color-brand-500)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
        >
          Yeni ürün
        </a>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <select
          name="category"
          [(ngModel)]="categoryFilter"
          class="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[14px] outline-none focus:border-[var(--fg)]"
        >
          <option value="">Tüm kategoriler</option>
          @for (category of categories(); track category.id) {
            <option [value]="category.id">{{ category.name }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <p class="mt-10 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else if (!filtered().length) {
        <p class="mt-10 text-[var(--fg-soft)]">Bu seçimde ürün yok.</p>
      } @else {
        <ul class="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white">
          @for (item of filtered(); track item.id) {
            <li class="flex items-center gap-4 border-b border-[var(--line)] px-4 py-3 last:border-b-0">
              <div class="flex size-12 shrink-0 items-center justify-center rounded border border-[var(--line)] p-1">
                <app-image [id]="item.imageId" [width]="96" [alt]="item.model" imgClass="max-h-full max-w-full object-contain" />
              </div>

              <div class="min-w-0 flex-1">
                <a
                  [routerLink]="['/admin/urunler', item.id]"
                  class="block truncate text-[15px] font-medium hover:text-[var(--color-brand-500)]"
                >
                  {{ item.model }}
                </a>
                <p class="mt-0.5 truncate text-[12.5px] text-[var(--fg-soft)]">
                  {{ item.category?.name }} · {{ filledSpecs(item) }}/6 özellik dolu
                </p>
              </div>

              <ui-status [status]="item.status" />

              <button
                type="button"
                class="px-2 text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--color-brand-500)]"
                (click)="askDelete(item)"
              >
                Sil
              </button>
            </li>
          }
        </ul>
      }

      <ui-confirm title="Ürün silinsin mi?" [message]="deleteMessage()" (confirmed)="remove()" />
    </div>
  `,
})
export class AdminProducts {
  private readonly admin = inject(AdminService);

  protected readonly items = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleteMessage = signal('');
  protected categoryFilter = '';

  private readonly confirm = viewChild.required(UiConfirm);
  private target: Product | null = null;

  protected readonly filtered = computed(() => {
    const filter = this.categoryFilter;
    return filter ? this.items().filter((p) => p.categoryId === Number(filter)) : this.items();
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const [products, categories] = await Promise.all([this.admin.products(), this.admin.categories()]);
    this.items.set(products);
    this.categories.set(categories);
    this.loading.set(false);
  }

  /** Kaç teknik özelliğin doldurulduğunu gösterir — eksik ürün göze çarpsın. */
  protected filledSpecs(product: Product): number {
    const fields = ['formFactor', 'processor', 'gpu', 'memory', 'driveBays', 'expansionSlots'];
    return fields.filter((field) => {
      const value = (product as unknown as Record<string, string>)[`${field}Tr`];
      return value?.trim().length > 0;
    }).length;
  }

  protected askDelete(item: Product): void {
    this.target = item;
    this.deleteMessage.set(`"${item.model}" silinecek. Bu işlem geri alınamaz.`);
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteProduct(this.target.id);
    this.target = null;
    await this.load();
  }
}
