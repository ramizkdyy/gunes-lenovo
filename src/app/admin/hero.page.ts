import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { DragHandle } from './drag-handle';
import { DragSort } from './drag-sort';
import { ImagePicker } from './image-picker';
import { INPUT_CLASS, STATUS_OPTIONS, errorMessage } from './shared';
import { UiConfirm, UiStatus } from './ui';
import type { HeroSlide, Status } from '../api/models';

/**
 * Ana sayfadaki tam ekran paneller. Liste ve düzenleme aynı ekranda:
 * panel sayısı az, ayrı sayfaya bölmek gereksiz tıklama olurdu.
 */
@Component({
  selector: 'app-admin-hero',
  imports: [FormsModule, ImagePicker, UiStatus, UiConfirm, DragHandle],
  template: `
    <div class="mx-auto w-full max-w-[820px] px-6 py-10">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-[22px] font-semibold">Ana sayfa panelleri</h1>
          <p class="mt-1 text-[14px] text-[var(--fg-soft)]">
            Ziyaretçi kaydırdıkça sırayla görünürler. Taşımak için panel başlığını sürükleyin.
          </p>
        </div>
        <button
          type="button"
          class="rounded-md bg-[var(--color-brand-500)] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
          (click)="addNew()"
        >
          Yeni panel
        </button>
      </div>

      @if (loading()) {
        <p class="mt-10 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else {
        <div class="mt-8 space-y-4">
          @for (slide of slides(); track slide.id; let i = $index) {
            <section
              class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white transition-colors"
              [class]="rowClass(i)"
            >
              <header
                class="flex items-center gap-3 border-b border-[var(--line)] px-5 py-3.5"
                (dragover)="sorter.enter(i, $event)"
                (dragleave)="sorter.leave(i)"
                (drop)="sorter.drop(i, $event)"
              >
                <!-- Sürükleme yalnızca tutamaçtan başlar. -->
                <ui-drag-handle
                  draggable="true"
                  [label]="slide.title || 'Panel'"
                  (dragstart)="sorter.start(i)"
                  (dragend)="sorter.reset()"
                  (moveUp)="sorter.moveBy(i, -1)"
                  (moveDown)="sorter.moveBy(i, 1)"
                />

                <span class="text-[14.5px] font-medium">{{ i + 1 }}. {{ slide.title || 'Başlıksız panel' }}</span>
                <ui-status [status]="slide.status" />

                <div class="ml-auto flex items-center gap-2">
                  <button type="button" class="px-2 text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]"
                          (click)="toggle(slide.id)">
                    {{ openId() === slide.id ? 'Kapat' : 'Düzenle' }}
                  </button>
                  <button type="button" class="px-2 text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--color-brand-500)]"
                          (click)="askDelete(slide)">Sil</button>
                </div>
              </header>

              @if (openId() === slide.id) {
                <div class="p-5">
                  <div class="grid gap-5 sm:grid-cols-2">
                    <label class="block">
                      <span class="mb-1.5 block text-[13px] font-medium">Yayın durumu</span>
                      <select [name]="'status' + slide.id" [(ngModel)]="slide.status" [class]="inputClass">
                        @for (option of statusOptions; track option.value) {
                          <option [value]="option.value">{{ option.label }}</option>
                        }
                      </select>
                    </label>

                    <label class="block">
                      <span class="mb-1.5 block text-[13px] font-medium">Zemin</span>
                      <select [name]="'theme' + slide.id" [(ngModel)]="slide.theme" [class]="inputClass">
                        <option value="dark-product">Koyu — ürün yanda</option>
                        <option value="light">Açık — ürün yanda</option>
                        <option value="dark">Koyu — fotoğraf arka planda</option>
                      </select>
                    </label>
                  </div>

                  <label class="mt-5 block sm:w-1/2 sm:pr-2.5">
                    <span class="mb-1.5 block text-[13px] font-medium">
                      Üst etiket <span class="font-normal text-[var(--fg-soft)]">— başlığın üstündeki küçük yazı</span>
                    </span>
                    <input [name]="'eyebrow' + slide.id" [(ngModel)]="slide.eyebrow" [class]="inputClass" />
                  </label>

                  <label class="mt-5 block">
                    <span class="mb-1.5 block text-[13px] font-medium">Başlık</span>
                    <input [name]="'title' + slide.id" [(ngModel)]="slide.title" [class]="inputClass" />
                  </label>

                  <label class="mt-5 block">
                    <span class="mb-1.5 block text-[13px] font-medium">Metin</span>
                    <textarea [name]="'body' + slide.id" rows="3" [(ngModel)]="slide.body" [class]="inputClass"></textarea>
                  </label>

                  <div class="mt-5 grid gap-5 sm:grid-cols-2">
                    <label class="block">
                      <span class="mb-1.5 block text-[13px] font-medium">Buton yazısı</span>
                      <input [name]="'ctaLabel' + slide.id" [(ngModel)]="slide.ctaLabel" [class]="inputClass" />
                    </label>
                    <label class="block">
                      <span class="mb-1.5 block text-[13px] font-medium">
                        Buton adresi <span class="font-normal text-[var(--fg-soft)]">— /teklif formu açar</span>
                      </span>
                      <input [name]="'ctaHref' + slide.id" [(ngModel)]="slide.ctaHref" [class]="inputClass" placeholder="/#urunler" />
                    </label>
                  </div>

                  <div class="mt-6">
                    <app-image-picker label="Panel görseli" [imageId]="slide.imageId" (imageIdChange)="slide.imageId = $event" />
                  </div>

                  @if (error()) {
                    <p class="mt-5 rounded-md bg-[var(--color-brand-050)] px-4 py-3 text-[13.5px] text-[var(--color-brand-600)]">
                      {{ error() }}
                    </p>
                  }

                  <div class="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      [disabled]="busy()"
                      class="rounded-md bg-[var(--color-brand-500)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-60"
                      (click)="save(slide)"
                    >
                      {{ busy() ? 'Kaydediliyor…' : 'Kaydet' }}
                    </button>
                    @if (savedId() === slide.id) {
                      <span class="text-[13.5px] text-emerald-600">Kaydedildi</span>
                    }
                  </div>
                </div>
              }
            </section>
          }
        </div>
      }

      <ui-confirm title="Panel silinsin mi?" [message]="deleteMessage()" (confirmed)="remove()" />
    </div>
  `,
})
export class AdminHero {
  private readonly admin = inject(AdminService);

  protected readonly inputClass = INPUT_CLASS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly slides = signal<HeroSlide[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly openId = signal<number | null>(null);
  protected readonly savedId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly deleteMessage = signal('');

  private readonly confirm = viewChild.required(UiConfirm);
  private target: HeroSlide | null = null;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.slides.set(await this.admin.heroSlides());
    this.loading.set(false);
  }

  protected toggle(id: number): void {
    this.openId.set(this.openId() === id ? null : id);
    this.savedId.set(null);
    this.error.set('');
  }

  protected async addNew(): Promise<void> {
    const created = await this.admin.createHeroSlide({
      status: 'DRAFT' as Status,
      title: 'Yeni panel',
      theme: 'dark',
      sort: this.slides().length,
    });
    await this.load();
    this.openId.set(created.id);
  }

  protected async save(slide: HeroSlide): Promise<void> {
    this.error.set('');
    this.savedId.set(null);
    this.busy.set(true);

    const body = { ...slide };
    delete (body as Record<string, unknown>)['image'];

    try {
      await this.admin.updateHeroSlide(slide.id, body);
      this.savedId.set(slide.id);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }

  /** Sürükleme ve klavye taşıması; yeni sıra hemen kaydedilir. */
  protected readonly sorter = new DragSort<HeroSlide>(
    () => this.slides(),
    async (next) => {
      this.slides.set(next);
      await this.admin.reorderHeroSlides(next.map((item, index) => ({ id: item.id, sort: index })));
    }
  );

  /** Sürüklenen panel soluklaşır, bırakılacak panel vurgulanır. */
  protected rowClass(index: number): string {
    if (this.sorter.dragging() === index) return 'opacity-40';
    if (this.sorter.over() === index) return 'border-[var(--color-brand-500)]';
    return '';
  }

  protected askDelete(slide: HeroSlide): void {
    this.target = slide;
    this.deleteMessage.set(`"${slide.title}" paneli silinecek. Bu işlem geri alınamaz.`);
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteHeroSlide(this.target.id);
    this.target = null;
    await this.load();
  }
}
