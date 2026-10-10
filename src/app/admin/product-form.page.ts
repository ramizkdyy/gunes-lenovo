import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from './admin.service';
import { ImagePicker } from './image-picker';
import { INPUT_CLASS, STATUS_OPTIONS, errorMessage, slugify } from './shared';
import { SpecEditor } from './spec-editor';
import type { Category, Product, Spec, Status } from '../api/models';

/**
 * Ürün formu. Teknik özellik satırları ürüne özel: yeni üründe
 * kategorinin başlık şablonuyla açılır, sonra satır eklenip silinebilir.
 * Benzer ürün için "Kopyasını oluştur" ya da "Başka üründen al" kullanılır.
 */
@Component({
  selector: 'app-admin-product-form',
  imports: [FormsModule, RouterLink, ImagePicker, SpecEditor],
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
              <select
                name="categoryId"
                [(ngModel)]="form().categoryId"
                (ngModelChange)="onCategoryChange($event)"
                [class]="inputClass"
              >
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

        <!-- Teknik özellikler: ürüne özel satırlar -->
        <section class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
          <h2 class="text-[15px] font-semibold">Teknik özellikler</h2>
          <p class="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--fg-soft)]">
            Sitede bu sırayla görünür. Değeri boş bırakılan satır sitede görünmez.
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-[var(--line)] px-3 py-2 text-[13px] font-medium hover:border-[var(--fg)] disabled:opacity-50"
              [disabled]="!template().length"
              [title]="template().length ? 'Başlıkları kategorinin sırasına getirir, girilmiş değerler korunur' : 'Kategorinin başlık şablonu boş'"
              (click)="applyTemplate()"
            >
              Kategori başlıklarını uygula
            </button>
            <select
              #copyFrom
              class="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-[13px] outline-none focus:border-[var(--fg)]"
              aria-label="Özellikleri başka üründen al"
              (change)="copySpecsFrom(+copyFrom.value); copyFrom.value = ''"
            >
              <option value="">Başka üründen al…</option>
              @for (other of otherProducts(); track other.id) {
                <option [value]="other.id">{{ other.model }}</option>
              }
            </select>
          </div>

          <div class="mt-5">
            <app-spec-editor [(rows)]="specs" />
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
          @if (!isNew()) {
            <button
              type="button"
              [disabled]="busy()"
              class="ml-auto rounded-md border border-[var(--line)] px-4 py-2.5 text-[13.5px] font-medium hover:border-[var(--fg)] disabled:opacity-60"
              title="Kayıtlı hâlinin taslak kopyasını açar"
              (click)="duplicate()"
            >
              Kopyasını oluştur
            </button>
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
  protected readonly categories = signal<Category[]>([]);
  private readonly products = signal<Product[]>([]);
  protected readonly specs = signal<Spec[]>([]);

  /** Seçili kategorinin başlık şablonu. */
  protected readonly template = computed(
    () => this.categories().find((c) => c.id === this.form().categoryId)?.specTemplate ?? []
  );
  protected readonly otherProducts = computed(() =>
    this.products().filter((p) => p.id !== Number(this.id()) && p.specs.length)
  );
  protected readonly form = signal<Partial<Product>>({ status: 'DRAFT' as Status, model: '', slug: '' });
  protected readonly imageId = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');

  protected isNew = () => this.id() === 'yeni';

  constructor() {
    void this.loadLists();

    // Rotadaki kimlik hazır olduğunda (ve değiştiğinde) kaydı yükler.
    effect(() => {
      const id = this.id();
      const preselected = Number(this.kategori());
      // Yalnızca rota değişince çalışsın; formu okuyup yazmak effect'i
      // yeniden tetikleyip döngüye sokmasın.
      untracked(() => {
        if (id !== 'yeni') {
          void this.load(Number(id));
        } else if (Number.isFinite(preselected) && preselected > 0) {
          this.onCategoryChange(preselected);
        }
      });
    });
  }

  private async loadLists(): Promise<void> {
    const [categories, products] = await Promise.all([this.admin.categories(), this.admin.products()]);
    this.categories.set(categories);
    this.products.set(products);
    // Kategori listeden önce seçildiyse (yeni ürün) şablon şimdi gelsin.
    if (this.isNew() && this.form().categoryId) this.onCategoryChange(this.form().categoryId!);
  }

  private async load(id: number): Promise<void> {
    const product = await this.admin.product(id);
    this.form.set(product);
    this.specs.set(product.specs ?? []);
    this.imageId.set(product.imageId);
  }

  /** Yeni üründe henüz değer girilmediyse satırlar kategorinin başlıklarıyla dolar. */
  protected onCategoryChange(categoryId: number): void {
    this.form.set({ ...this.form(), categoryId });
    const untouched = this.specs().every((spec) => !spec.value.trim());
    if (this.isNew() && untouched) {
      this.specs.set(this.template().map((label) => ({ label, value: '' })));
    }
  }

  /**
   * Başlıkları kategorinin sırasına getirir. Aynı başlıktaki değer korunur;
   * şablonda olmayan dolu satırlar sona eklenir, hiçbir değer kaybolmaz.
   */
  protected applyTemplate(): void {
    const current = this.specs();
    const byLabel = new Map(current.map((spec) => [spec.label.trim().toLocaleLowerCase('tr'), spec.value]));
    const fromTemplate = this.template().map((label) => ({
      label,
      value: byLabel.get(label.toLocaleLowerCase('tr')) ?? '',
    }));
    const templateKeys = new Set(this.template().map((label) => label.toLocaleLowerCase('tr')));
    const extra = current.filter(
      (spec) => spec.value.trim() && !templateKeys.has(spec.label.trim().toLocaleLowerCase('tr'))
    );
    this.specs.set([...fromTemplate, ...extra]);
  }

  /** Başka ürünün satırlarını (başlık + değer) olduğu gibi alır; kaydedilene kadar geri alınabilir. */
  protected copySpecsFrom(productId: number): void {
    const source = this.products().find((p) => p.id === productId);
    if (source) this.specs.set(source.specs.map((spec) => ({ ...spec })));
  }

  protected async duplicate(): Promise<void> {
    this.busy.set(true);
    try {
      const copy = await this.admin.copyProduct(Number(this.id()));
      this.saved.set(false);
      await this.router.navigate(['/admin/urunler', copy.id]);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
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

    const body = { ...this.form(), specs: this.specs(), imageId: this.imageId() };
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
