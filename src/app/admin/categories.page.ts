import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppImage } from '../api/app-image';
import { AdminService } from './admin.service';
import { DragHandle } from './drag-handle';
import { DragSort } from './drag-sort';
import { UiConfirm, UiStatus } from './ui';
import type { Category } from '../api/models';

/** Kategori listesi: sıralama, yayın durumu, hızlı erişim. */
@Component({
  selector: 'app-admin-categories',
  imports: [RouterLink, AppImage, UiStatus, UiConfirm, DragHandle],
  template: `
    <div class="mx-auto w-full max-w-[1000px] px-6 py-10">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-[22px] font-semibold">Kategoriler</h1>
          <p class="mt-1 text-[14px] text-[var(--fg-soft)]">
            Sitedeki sıraları yukarıdan aşağıya aynıdır. Taşımak için satırı sürükleyin.
          </p>
        </div>
        <a
          routerLink="/admin/kategoriler/yeni"
          class="rounded-md bg-[var(--color-brand-500)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
        >
          Yeni kategori
        </a>
      </div>

      @if (loading()) {
        <p class="mt-10 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else if (!items().length) {
        <p class="mt-10 text-[var(--fg-soft)]">Henüz kategori yok.</p>
      } @else {
        <ul class="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white">
          @for (item of items(); track item.id; let i = $index) {
            <li
              class="flex items-center gap-4 border-b border-[var(--line)] px-4 py-3 transition-colors last:border-b-0"
              [class]="rowClass(i)"
              (dragover)="sorter.enter(i, $event)"
              (dragleave)="sorter.leave(i)"
              (drop)="sorter.drop(i, $event)"
            >
              <!-- Sürükleme yalnızca tutamaçtan başlar; satırdaki bağlantı
                   normal davranışını korusun diye. -->
              <ui-drag-handle
                draggable="true"
                [label]="item.name"
                (dragstart)="sorter.start(i)"
                (dragend)="sorter.reset()"
                (moveUp)="sorter.moveBy(i, -1)"
                (moveDown)="sorter.moveBy(i, 1)"
              />

              <div class="flex size-12 shrink-0 items-center justify-center rounded border border-[var(--line)] p-1">
                <app-image [id]="item.imageId" [width]="96" [alt]="item.name" imgClass="max-h-full max-w-full object-contain" />
              </div>

              <div class="min-w-0 flex-1">
                <a
                  [routerLink]="['/admin/kategoriler', item.id]"
                  class="block truncate text-[15px] font-medium hover:text-[var(--color-brand-500)]"
                >
                  {{ item.name }}
                </a>
                <p class="mt-0.5 truncate text-[12.5px] text-[var(--fg-soft)]">
                  /{{ item.slug }} · {{ item._count?.products ?? 0 }} ürün
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

      <ui-confirm
        #confirm
        title="Kategori silinsin mi?"
        [message]="deleteMessage()"
        (confirmed)="remove()"
      />
    </div>
  `,
})
export class AdminCategories {
  private readonly admin = inject(AdminService);

  protected readonly items = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleteMessage = signal('');

  /** Sürüklenen satır soluklaşır, bırakılacak satır vurgulanır. */
  protected rowClass(index: number): string {
    if (this.sorter.dragging() === index) return 'opacity-40';
    if (this.sorter.over() === index) return 'bg-[var(--color-n-025)]';
    return '';
  }

  private readonly confirm = viewChild.required(UiConfirm);
  private target: Category | null = null;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.items.set(await this.admin.categories());
    this.loading.set(false);
  }

  /** Sürükleme ve klavye taşıması; yeni sıra hemen kaydedilir. */
  protected readonly sorter = new DragSort<Category>(
    () => this.items(),
    async (next) => {
      this.items.set(next);
      await this.admin.reorderCategories(next.map((item, index) => ({ id: item.id, sort: index })));
    }
  );

  protected askDelete(item: Category): void {
    this.target = item;
    const count = item._count?.products ?? 0;
    this.deleteMessage.set(
      count
        ? `"${item.name}" ve içindeki ${count} ürün silinecek. Bu işlem geri alınamaz.`
        : `"${item.name}" silinecek. Bu işlem geri alınamaz.`
    );
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteCategory(this.target.id);
    this.target = null;
    await this.load();
  }
}
