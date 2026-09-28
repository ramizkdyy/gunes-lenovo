import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppImage } from '../api/app-image';
import { AdminService } from './admin.service';
import { UiConfirm } from './ui';
import type { Media } from '../api/models';

/** Yüklenen tüm görseller. Buradan silinen görsel kullanıldığı yerde yer tutucuya döner. */
@Component({
  selector: 'app-admin-media',
  imports: [FormsModule, AppImage, UiConfirm],
  template: `
    <div class="mx-auto w-full max-w-[1000px] px-6 py-10">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-[22px] font-semibold">Görseller</h1>
          <p class="mt-1 text-[14px] text-[var(--fg-soft)]">{{ items().length }} görsel yüklü.</p>
        </div>
        <label
          class="cursor-pointer rounded-md bg-[var(--color-brand-500)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
        >
          {{ uploading() ? 'Yükleniyor…' : 'Görsel yükle' }}
          <input type="file" accept="image/*" multiple class="hidden" (change)="upload($event)" />
        </label>
      </div>

      @if (error()) {
        <p class="mt-5 rounded-md bg-[var(--color-brand-050)] px-4 py-3 text-[13.5px] text-[var(--color-brand-600)]">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <p class="mt-10 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else if (!items().length) {
        <p class="mt-10 text-[var(--fg-soft)]">Henüz görsel yok.</p>
      } @else {
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of items(); track item.id) {
            <article class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-4">
              <div class="flex h-36 items-center justify-center rounded border border-[var(--line)] p-2">
                <app-image [id]="item.id" [width]="300" [alt]="item.alt" imgClass="max-h-full max-w-full object-contain" />
              </div>

              <p class="mt-3 text-[12.5px] text-[var(--fg-soft)]">
                {{ item.width }}×{{ item.height }}px · {{ kb(item.size) }}
              </p>

              <label class="mt-3 block">
                <span class="mb-1 block text-[12.5px] font-medium">
                  Alternatif metin
                  <span class="font-normal text-[var(--fg-soft)]">— görsel açılmazsa okunur</span>
                </span>
                <input
                  [name]="'alt' + item.id"
                  [(ngModel)]="item.alt"
                  (blur)="saveAlt(item)"
                  class="w-full rounded-md border border-[var(--line)] px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--fg)]"
                />
              </label>

              <button
                type="button"
                class="mt-3 text-[13px] text-[var(--fg-soft)] hover:text-[var(--color-brand-500)]"
                (click)="askDelete(item)"
              >
                Sil
              </button>
            </article>
          }
        </div>
      }

      <ui-confirm
        title="Görsel silinsin mi?"
        message="Bu görseli kullanan kayıtlarda yer tutucu görünecek. İşlem geri alınamaz."
        (confirmed)="remove()"
      />
    </div>
  `,
})
export class AdminMedia {
  private readonly admin = inject(AdminService);

  protected readonly items = signal<Media[]>([]);
  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly error = signal('');

  private readonly confirm = viewChild.required(UiConfirm);
  private target: Media | null = null;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.items.set(await this.admin.media());
    this.loading.set(false);
  }

  protected kb(bytes: number): string {
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} kB`;
  }

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    if (!files.length) return;

    this.error.set('');
    this.uploading.set(true);
    try {
      for (const file of files) {
        await this.admin.uploadMedia(file);
      }
      await this.load();
    } catch {
      this.error.set('Bazı dosyalar yüklenemedi. Boyutu 25 MB’ı aşmamalı.');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  protected async saveAlt(item: Media): Promise<void> {
    await this.admin.updateMediaAlt(item.id, item.alt);
  }

  protected askDelete(item: Media): void {
    this.target = item;
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteMedia(this.target.id);
    this.target = null;
    await this.load();
  }
}
