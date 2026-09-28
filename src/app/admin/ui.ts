import { Component, computed, input, output, signal } from '@angular/core';

/**
 * Panelin ortak parçaları. Hazır bir kütüphane yerine elle yazıldı;
 * sitenin tasarım token'larını (--line, --fg-soft, --color-brand-500)
 * kullanıyor, böylece panel ve site aynı dili konuşuyor.
 */

/** Etiketli metin kutusu. */
@Component({
  selector: 'ui-field',
  template: `
    <label class="block">
      <span class="mb-1.5 flex items-baseline gap-2">
        <span class="text-[13px] font-medium text-[var(--fg)]">{{ label() }}</span>
        @if (hint()) {
          <span class="text-[12px] text-[var(--fg-soft)]">{{ hint() }}</span>
        }
      </span>
      <ng-content />
      @if (error()) {
        <span class="mt-1 block text-[12.5px] text-[var(--color-brand-500)]">{{ error() }}</span>
      }
    </label>
  `,
})
export class UiField {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input('');
}

/** Yayın durumu rozeti. */
@Component({
  selector: 'ui-status',
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
      [class]="published() ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--color-n-100)] text-[var(--fg-soft)]'"
    >
      <span class="size-1.5 rounded-full" [class]="published() ? 'bg-emerald-500' : 'bg-[var(--color-n-400)]'"></span>
      {{ published() ? 'Yayında' : 'Taslak' }}
    </span>
  `,
})
export class UiStatus {
  readonly status = input.required<string>();
  protected readonly published = computed(() => this.status() === 'PUBLISHED');
}

/**
 * Silme gibi geri alınamaz işlemler için onay kutusu.
 * Tek tıkla silinmesin diye araya giriyor.
 */
@Component({
  selector: 'ui-confirm',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-[420px] rounded-[var(--radius-card)] bg-white p-6 shadow-xl">
          <h3 class="text-[17px] font-semibold">{{ title() }}</h3>
          <p class="mt-2 text-[14.5px] leading-[1.6] text-[var(--fg-soft)]">{{ message() }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-md border border-[var(--line)] px-4 py-2 text-[14px] font-medium transition-colors hover:border-[var(--fg)]"
              (click)="open.set(false)"
            >
              Vazgeç
            </button>
            <button
              type="button"
              class="rounded-md bg-[var(--color-brand-500)] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]"
              (click)="open.set(false); confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UiConfirm {
  readonly title = input('Emin misiniz?');
  readonly message = input('Bu işlem geri alınamaz.');
  readonly confirmLabel = input('Sil');
  readonly confirmed = output<void>();

  readonly open = signal(false);

  ask(): void {
    this.open.set(true);
  }
}
