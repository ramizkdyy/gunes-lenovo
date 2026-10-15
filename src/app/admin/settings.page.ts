import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { INPUT_CLASS, errorMessage } from './shared';
import { telHref } from '../api/models';

/** Sitenin genel ayarları: iletişim numarası ve form bildirim adresi. */
@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule],
  template: `
    <div class="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 class="text-[22px] font-semibold">Site ayarları</h1>

      @if (loading()) {
        <p class="mt-8 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else {
        <form
          class="mt-8 space-y-5 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-6"
          (ngSubmit)="save()"
        >
          <div>
            <label for="settings-phone" class="block text-[14px] font-medium">Telefon numarası</label>
            <p class="mt-1 text-[13px] text-[var(--fg-soft)]">
              Üst menüde, sayfa altında ve teklif sayfasında görünür. Boş bırakırsanız sitede gösterilmez.
            </p>
            <input
              id="settings-phone"
              name="phone"
              type="tel"
              autocomplete="off"
              [(ngModel)]="phone"
              [class]="inputClass + ' mt-2 max-w-[320px]'"
              placeholder="+90 342 325 55 55"
            />
            @if (phone.trim()) {
              <p class="mt-2 text-[12.5px] text-[var(--fg-soft)]">Tıklanınca aranacak: {{ preview() }}</p>
            }
          </div>

          <div>
            <label for="settings-notify" class="block text-[14px] font-medium">Teklif formu e-postası</label>
            <p class="mt-1 text-[13px] text-[var(--fg-soft)]">
              Formdan gelen her talep bu adrese e-postayla gider. Birden fazla adres için virgülle ayırın.
            </p>
            <input
              id="settings-notify"
              name="notifyEmail"
              type="text"
              inputmode="email"
              autocomplete="off"
              [(ngModel)]="notifyEmail"
              [class]="inputClass + ' mt-2 max-w-[480px]'"
              placeholder="latif@gunesbilgisayar.com.tr"
            />
          </div>

          @if (error()) {
            <p class="rounded-md bg-[var(--color-brand-050)] px-4 py-3 text-[13.5px] text-[var(--color-brand-600)]">
              {{ error() }}
            </p>
          }

          <div class="flex items-center gap-4">
            <button
              type="submit"
              [disabled]="busy()"
              class="rounded-md bg-[var(--color-brand-500)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-60"
            >
              Kaydet
            </button>
            @if (saved()) {
              <span class="text-[13.5px] text-[var(--fg-soft)]">Kaydedildi</span>
            }
          </div>
        </form>
      }
    </div>
  `,
})
export class AdminSettings {
  private readonly admin = inject(AdminService);

  protected readonly inputClass = INPUT_CLASS;
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly saved = signal(false);
  protected readonly error = signal('');
  protected phone = '';
  protected notifyEmail = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const settings = await this.admin.settings();
      this.phone = settings.phone;
      this.notifyEmail = settings.notifyEmail;
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected preview(): string {
    return telHref(this.phone).replace('tel:', '');
  }

  protected async save(): Promise<void> {
    this.error.set('');
    this.saved.set(false);
    this.busy.set(true);
    try {
      const settings = await this.admin.updateSettings({ phone: this.phone, notifyEmail: this.notifyEmail });
      this.phone = settings.phone;
      this.notifyEmail = settings.notifyEmail;
      this.saved.set(true);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
