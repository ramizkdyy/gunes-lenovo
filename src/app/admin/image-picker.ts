import { Component, inject, input, model, signal } from '@angular/core';
import { AppImage } from '../api/app-image';
import { AdminService } from './admin.service';
import type { Media } from '../api/models';

/**
 * Görsel seçme alanı: yüklemek için dosya seçtirir ya da daha önce
 * yüklenenlerden birini seçtirir. Seçilen görselin kimliği dışarı
 * `imageId` olarak verilir.
 */
@Component({
  selector: 'app-image-picker',
  imports: [AppImage],
  template: `
    <div>
      <span class="mb-1.5 block text-[13px] font-medium">{{ label() }}</span>

      <div class="flex items-start gap-4">
        <div class="flex size-28 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-white p-2">
          <app-image [id]="imageId()" [width]="200" alt="" imgClass="max-h-full max-w-full object-contain" />
        </div>

        <div class="flex flex-col gap-2">
          <label
            class="cursor-pointer rounded-md border border-[var(--line)] px-4 py-2 text-center text-[13.5px] font-medium transition-colors hover:border-[var(--fg)]"
          >
            {{ uploading() ? 'Yükleniyor…' : 'Bilgisayardan yükle' }}
            <input type="file" accept="image/*" class="hidden" (change)="upload($event)" />
          </label>

          <button
            type="button"
            class="rounded-md border border-[var(--line)] px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-[var(--fg)]"
            (click)="openLibrary()"
          >
            Yüklenenlerden seç
          </button>

          @if (imageId()) {
            <button
              type="button"
              class="px-1 text-left text-[13px] text-[var(--fg-soft)] underline-offset-2 hover:underline"
              (click)="imageId.set(null)"
            >
              Görseli kaldır
            </button>
          }
        </div>
      </div>

      @if (error()) {
        <p class="mt-2 text-[12.5px] text-[var(--color-brand-500)]">{{ error() }}</p>
      }

      @if (libraryOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" (click)="libraryOpen.set(false)">
          <div class="max-h-[80vh] w-full max-w-[760px] overflow-auto rounded-[var(--radius-card)] bg-white p-6" (click)="$event.stopPropagation()">
            <h3 class="text-[17px] font-semibold">Yüklenen görseller</h3>

            @if (library().length) {
              <div class="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                @for (item of library(); track item.id) {
                  <button
                    type="button"
                    class="flex aspect-square items-center justify-center rounded-md border-2 p-2 transition-colors"
                    [class]="item.id === imageId() ? 'border-[var(--color-brand-500)]' : 'border-[var(--line)] hover:border-[var(--fg-soft)]'"
                    (click)="choose(item)"
                  >
                    <app-image [id]="item.id" [width]="200" [alt]="item.alt" imgClass="max-h-full max-w-full object-contain" />
                  </button>
                }
              </div>
            } @else {
              <p class="mt-5 text-[14px] text-[var(--fg-soft)]">Henüz görsel yüklenmemiş.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ImagePicker {
  readonly label = input('Görsel');
  /** İki yönlü: seçilen görselin kimliği. */
  readonly imageId = model<string | null>(null);

  private readonly admin = inject(AdminService);

  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly libraryOpen = signal(false);
  protected readonly library = signal<Media[]>([]);

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set('');
    this.uploading.set(true);
    try {
      const media = await this.admin.uploadMedia(file);
      this.imageId.set(media.id);
    } catch {
      this.error.set('Yüklenemedi. Dosya 25 MB’ı aşıyor olabilir.');
    } finally {
      this.uploading.set(false);
      // Aynı dosya tekrar seçilebilsin diye girdiyi boşalt.
      input.value = '';
    }
  }

  protected async openLibrary(): Promise<void> {
    this.libraryOpen.set(true);
    this.library.set(await this.admin.media());
  }

  protected choose(media: Media): void {
    this.imageId.set(media.id);
    this.libraryOpen.set(false);
  }
}
