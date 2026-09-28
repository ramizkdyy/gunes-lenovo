import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from './admin.service';
import { ImagePicker } from './image-picker';
import { INPUT_CLASS, STATUS_OPTIONS, errorMessage, slugify } from './shared';
import type { Category, Status } from '../api/models';

/** Kategori ekleme/düzenleme formu. */
@Component({
  selector: 'app-admin-category-form',
  imports: [FormsModule, RouterLink, ImagePicker],
  template: `
    <div class="mx-auto w-full max-w-[720px] px-6 py-10">
      <a routerLink="/admin/kategoriler" class="text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]">
        ← Kategoriler
      </a>

      <h1 class="mt-4 text-[22px] font-semibold">
        {{ isNew() ? 'Yeni kategori' : form().name }}
      </h1>

      <form class="mt-8 space-y-6" (ngSubmit)="save()">
        <div class="rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6">
          <div class="grid gap-5 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Yayın durumu</span>
              <select name="status" [(ngModel)]="form().status" [class]="inputClass">
                @for (option of statusOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">
                URL adı
                <span class="font-normal text-[var(--fg-soft)]">— adres çubuğunda görünür</span>
              </span>
              <input name="slug" [(ngModel)]="form().slug" [class]="inputClass" placeholder="rack-sunucular" />
            </label>
          </div>

          <div class="mt-5 grid gap-5 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Ad</span>
              <input
                name="name"
                [(ngModel)]="form().name"
                (blur)="fillSlug()"
                [class]="inputClass"
                placeholder="Rack Sunucular"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[13px] font-medium">Ürün ailesi</span>
              <input name="families" [(ngModel)]="form().families" [class]="inputClass" placeholder="ThinkSystem SR" />
            </label>
          </div>

          <label class="mt-5 block">
            <span class="mb-1.5 block text-[13px] font-medium">Açıklama</span>
            <textarea name="desc" rows="3" [(ngModel)]="form().desc" [class]="inputClass"></textarea>
          </label>

          <div class="mt-6">
            <app-image-picker label="Kategori görseli" [(imageId)]="imageId" />
          </div>
        </div>

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
          <a routerLink="/admin/kategoriler" class="text-[14px] text-[var(--fg-soft)] hover:text-[var(--fg)]">Vazgeç</a>
          @if (saved()) {
            <span class="text-[13.5px] text-emerald-600">Kaydedildi</span>
          }
        </div>
      </form>
    </div>
  `,
})
export class AdminCategoryForm {
  /** Rotadan gelir; "yeni" ise boş form açılır. */
  readonly id = input<string>('yeni');

  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  protected readonly inputClass = INPUT_CLASS;
  protected readonly statusOptions = STATUS_OPTIONS;

  protected readonly form = signal<Partial<Category>>({
    status: 'DRAFT' as Status,
    slug: '',
    name: '',
    desc: '',
    families: '',
  });
  protected readonly imageId = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');

  protected isNew = () => this.id() === 'yeni';

  constructor() {
    // Rotadaki kimlik hazır olduğunda (ve değiştiğinde) kaydı yükler.
    effect(() => {
      const id = this.id();
      if (id === 'yeni') return;
      void this.load(Number(id));
    });
  }

  private async load(id: number): Promise<void> {
    const category = await this.admin.category(id);
    this.form.set(category);
    this.imageId.set(category.imageId);
  }

  /** Türkçe ad yazıldıysa ve URL adı boşsa kendiliğinden doldur. */
  protected fillSlug(): void {
    const current = this.form();
    if (!current.slug && current.name) {
      this.form.set({ ...current, slug: slugify(current.name) });
    }
  }

  protected async save(): Promise<void> {
    this.error.set('');
    this.saved.set(false);
    this.busy.set(true);

    const body = { ...this.form(), imageId: this.imageId() };
    // Sunucu bu alanları kabul etmiyor; ilişkili kayıtlar ayrı yönetiliyor.
    delete (body as Record<string, unknown>)['image'];
    delete (body as Record<string, unknown>)['products'];
    delete (body as Record<string, unknown>)['_count'];

    try {
      if (this.isNew()) {
        const created = await this.admin.createCategory(body);
        await this.router.navigate(['/admin/kategoriler', created.id]);
      } else {
        await this.admin.updateCategory(Number(this.id()), body);
        this.saved.set(true);
      }
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
