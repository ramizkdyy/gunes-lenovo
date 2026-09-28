import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SPEC_FIELDS } from '../api/models';
import { AdminService } from './admin.service';
import { ImagePicker } from './image-picker';
import { INPUT_CLASS, STATUS_OPTIONS, errorMessage, slugify } from './shared';
import type { Category, Product, Status } from '../api/models';

/**
 * Ürün formu. Teknik özellikler sabit: her üründe aynı altı başlık,
 * aynı sırada. Başlıklar SPEC_FIELDS'ten geliyor, formda elle
 * yazılmıyor — site ile panelin sırası hep aynı kalsın diye.
 */
@Component({
  selector: 'app-admin-product-form',
  imports: [FormsModule, RouterLink, ImagePicker],
  template: `
    <div class="mx-auto w-full max-w-[820px] px-6 py-10">
      <a routerLink="/admin/urunler" class="text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]">← Ürünler</a>

      <h1 class="mt-4 text-[22px] font-semibold">{{ isNew() ? 'Yeni ürün' : form().model }}</h1>

      <form class="mt-8 space-y-6" (ngSubmit)="save()">
        <!-- Temel bilgiler -->
        <section class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
          <h2 class="text-[15px] font-semibold">Temel bilgiler</h2>

          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Yayın durumu</span>
              <select name="status" [(ngModel)]="form().status" [class]="inputClass">
                @for (option of statusOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Kategori</span>
              <select name="categoryId" [(ngModel)]="form().categoryId" [class]="inputClass">
                <option [ngValue]="undefined" disabled>Seçin…</option>
                @for (category of categories(); track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </label>
          </div>

          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Model adı</span>
              <input
                name="model"
                [(ngModel)]="form().model"
                (blur)="fillSlug()"
                [class]="inputClass"
                placeholder="ThinkSystem SR650 V4"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">
                URL adı <span class="font-normal text-[var(--fg-soft)]">— adres çubuğunda görünür</span>
              </span>
              <input name="slug" [(ngModel)]="form().slug" [class]="inputClass" placeholder="sr650-v4" />
            </label>
          </div>

          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Kısa başlık</span>
              <input name="title" [(ngModel)]="form().title" [class]="inputClass" placeholder="Çift soketli 2U ana iş gücü" />
            </label>
          </div>

          <label class="mt-5 block">
            <span class="mb-1.5 block text-[13px] font-medium">Açıklama</span>
            <textarea name="desc" rows="3" [(ngModel)]="form().desc" [class]="inputClass"></textarea>
          </label>

          <label class="mt-5 block">
            <span class="mb-1.5 block text-[13px] font-medium">Teknik döküman bağlantısı</span>
            <input name="datasheetUrl" [(ngModel)]="form().datasheetUrl" [class]="inputClass" placeholder="https://…" />
          </label>

          <div class="mt-6">
            <app-image-picker label="Ürün görseli" [(imageId)]="imageId" />
          </div>
        </section>

        <!-- Sabit teknik özellikler -->
        <section class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
          <h2 class="text-[15px] font-semibold">Teknik özellikler</h2>
          <p class="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--fg-soft)]">
            Başlıklar her üründe aynı. Boş bıraktığınız satır sitede görünmez.
          </p>

          <div class="mt-5 space-y-5">
            @for (spec of specFields; track spec.field) {
              <div class="grid gap-3 sm:grid-cols-[150px_1fr]">
                <span class="pt-2.5 text-[13.5px] font-medium">{{ spec.label }}</span>
                <input
                  [name]="spec.field"
                  [ngModel]="value(spec.field)"
                  (ngModelChange)="set(spec.field, $event)"
                  [class]="inputClass"
                />
              </div>
            }
          </div>
        </section>

        @if (error()) {
          <p class="rounded-md bg-[var(--color-brand-050)] px-4 py-3 text-[13.5px] text-[var(--color-brand-600)]">
            {{ error() }}
          </p>
        }

        <div class="flex items-center gap-3">
          <button
            type="submit"
            [disabled]="busy()"
            class="rounded-md bg-[var(--color-brand-500)] px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-60"
          >
            {{ busy() ? 'Kaydediliyor…' : 'Kaydet' }}
          </button>
          <a routerLink="/admin/urunler" class="text-[14px] text-[var(--fg-soft)] hover:text-[var(--fg)]">Vazgeç</a>
          @if (saved()) {
            <span class="text-[13.5px] text-emerald-600">Kaydedildi</span>
          }
        </div>
      </form>
    </div>
  `,
})
export class AdminProductForm {
  readonly id = input<string>('yeni');
  /** Yeni ürün bu kategoriyle açılsın (listeden "ürün ekle" ile gelince). */
  readonly kategori = input<string>('');

  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  protected readonly inputClass = INPUT_CLASS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly specFields = SPEC_FIELDS;

  protected readonly categories = signal<Category[]>([]);
  protected readonly form = signal<Partial<Product>>({ status: 'DRAFT' as Status, model: '', slug: '' });
  protected readonly imageId = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');

  protected isNew = () => this.id() === 'yeni';

  constructor() {
    void this.loadCategories();

    // Rotadaki kimlik hazır olduğunda (ve değiştiğinde) kaydı yükler.
    effect(() => {
      const id = this.id();
      if (id === 'yeni') {
        const preselected = Number(this.kategori());
        if (Number.isFinite(preselected) && preselected > 0) {
          this.form.set({ ...this.form(), categoryId: preselected });
        }
        return;
      }
      void this.load(Number(id));
    });
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.admin.categories());
  }

  private async load(id: number): Promise<void> {
    const product = await this.admin.product(id);
    this.form.set(product);
    this.imageId.set(product.imageId);
  }

  /** Özellik alanlarını tek tek tanımlamak yerine dinamik oku/yaz. */
  protected value(field: string): string {
    return (this.form() as Record<string, unknown>)[field] as string ?? '';
  }

  protected set(field: string, value: string): void {
    this.form.set({ ...this.form(), [field]: value });
  }

  protected fillSlug(): void {
    const current = this.form();
    if (!current.slug && current.model) {
      this.form.set({ ...current, slug: slugify(current.model) });
    }
  }

  protected async save(): Promise<void> {
    this.error.set('');
    this.saved.set(false);
    this.busy.set(true);

    const body = { ...this.form(), imageId: this.imageId() };
    delete (body as Record<string, unknown>)['image'];
    delete (body as Record<string, unknown>)['category'];

    try {
      if (this.isNew()) {
        const created = await this.admin.createProduct(body);
        await this.router.navigate(['/admin/urunler', created.id]);
      } else {
        await this.admin.updateProduct(Number(this.id()), body);
        this.saved.set(true);
      }
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
