import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { AdminService } from './admin.service';
import { UiConfirm } from './ui';
import type { Message, MessageStatus } from '../api/models';

/**
 * Siteden gelen mesajlar. Okunmamışlar öne çıkar; satıra tıklayınca
 * tamamı açılır ve okundu işaretlenir.
 */
@Component({
  selector: 'app-admin-messages',
  imports: [UiConfirm],
  template: `
    <div class="mx-auto w-full max-w-[1000px] px-6 py-10">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-[22px] font-semibold">Mesajlar</h1>
          <p class="mt-1 text-[14px] text-[var(--fg-soft)]">
            Sitedeki formdan gelen teklif ve destek talepleri.
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        @for (tab of tabs; track tab.value) {
          <button
            type="button"
            class="rounded-md px-3.5 py-2 text-[14px] transition-colors"
            [class]="filter() === tab.value
              ? 'bg-[var(--fg)] text-white font-medium'
              : 'border border-[var(--line)] bg-white text-[var(--fg-soft)] hover:border-[var(--fg-soft)]'"
            (click)="setFilter(tab.value)"
          >
            {{ tab.label }}
            @if (tab.value === 'NEW' && unread()) {
              <span class="ml-1.5 font-semibold">{{ unread() }}</span>
            }
          </button>
        }
      </div>

      @if (loading()) {
        <p class="mt-10 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else if (!items().length) {
        <p class="mt-10 text-[var(--fg-soft)]">
          {{ filter() === 'NEW' ? 'Okunmamış mesaj yok.' : 'Bu listede mesaj yok.' }}
        </p>
      } @else {
        <ul class="mt-6 space-y-3">
          @for (item of items(); track item.id) {
            <li
              class="overflow-hidden rounded-[var(--radius-card)] border bg-white"
              [class]="item.status === 'NEW' ? 'border-[var(--color-brand-500)]' : 'border-[var(--line)]'"
            >
              <button
                type="button"
                class="flex w-full items-center gap-4 px-5 py-4 text-left"
                (click)="toggle(item)"
              >
                @if (item.status === 'NEW') {
                  <span class="size-2 shrink-0 rounded-full bg-[var(--color-brand-500)]" aria-label="Okunmamış"></span>
                } @else {
                  <span class="size-2 shrink-0"></span>
                }

                <div class="min-w-0 flex-1">
                  <p class="truncate text-[15px]" [class.font-semibold]="item.status === 'NEW'">
                    {{ item.name }}@if (item.company) { <span class="text-[var(--fg-soft)]"> · {{ item.company }}</span> }
                  </p>
                  <p class="mt-0.5 truncate text-[13px] text-[var(--fg-soft)]">
                    {{ item.topicLabel || 'Konu belirtilmemiş' }}
                    @if (item.productLabel) { · {{ item.productLabel }} }
                  </p>
                </div>

                <span class="shrink-0 text-[12.5px] text-[var(--fg-soft)]">{{ when(item.createdAt) }}</span>
              </button>

              @if (openId() === item.id) {
                <div class="border-t border-[var(--line)] px-5 py-5">
                  <dl class="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-[110px_1fr]">
                    @if (item.phone) {
                      <dt class="text-[var(--fg-soft)]">Telefon</dt>
                      <dd><a [href]="'tel:' + item.phone" class="hover:text-[var(--color-brand-500)]">{{ item.phone }}</a></dd>
                    }
                    @if (item.email) {
                      <dt class="text-[var(--fg-soft)]">E-posta</dt>
                      <dd><a [href]="'mailto:' + item.email" class="hover:text-[var(--color-brand-500)]">{{ item.email }}</a></dd>
                    }
                    @if (item.productLabel) {
                      <dt class="text-[var(--fg-soft)]">Ürün</dt>
                      <dd>{{ item.productLabel }}</dd>
                    }
                    @if (item.sourcePath) {
                      <dt class="text-[var(--fg-soft)]">Geldiği sayfa</dt>
                      <dd class="text-[var(--fg-soft)]">{{ item.sourcePath }}</dd>
                    }
                    <dt class="text-[var(--fg-soft)]">Tarih</dt>
                    <dd>{{ fullDate(item.createdAt) }}</dd>
                  </dl>

                  <p class="mt-5 whitespace-pre-wrap text-[15px] leading-[1.7]">{{ item.body }}</p>

                  <div class="mt-6 flex flex-wrap items-center gap-3">
                    @if (item.status !== 'ARCHIVED') {
                      <button
                        type="button"
                        class="rounded-md border border-[var(--line)] px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-[var(--fg)]"
                        (click)="setStatus(item, 'ARCHIVED')"
                      >
                        Arşivle
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="rounded-md border border-[var(--line)] px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-[var(--fg)]"
                        (click)="setStatus(item, 'READ')"
                      >
                        Arşivden çıkar
                      </button>
                    }

                    @if (item.status !== 'NEW') {
                      <button
                        type="button"
                        class="text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--fg)]"
                        (click)="setStatus(item, 'NEW')"
                      >
                        Okunmadı işaretle
                      </button>
                    }

                    <button
                      type="button"
                      class="ml-auto text-[13.5px] text-[var(--fg-soft)] hover:text-[var(--color-brand-500)]"
                      (click)="askDelete(item)"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      }

      <ui-confirm
        title="Mesaj silinsin mi?"
        message="Mesaj kalıcı olarak silinecek. Saklamak istiyorsanız arşivleyin."
        (confirmed)="remove()"
      />
    </div>
  `,
})
export class AdminMessages {
  private readonly admin = inject(AdminService);

  protected readonly tabs = [
    { value: 'NEW' as const, label: 'Okunmamış' },
    { value: '' as const, label: 'Tümü' },
    { value: 'ARCHIVED' as const, label: 'Arşiv' },
  ];

  protected readonly items = signal<Message[]>([]);
  protected readonly loading = signal(true);
  protected readonly filter = signal<'NEW' | '' | 'ARCHIVED'>('NEW');
  protected readonly openId = signal<number | null>(null);

  protected readonly unread = computed(
    () => this.items().filter((item) => item.status === 'NEW').length
  );

  private readonly confirm = viewChild.required(UiConfirm);
  private target: Message | null = null;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    const status = this.filter();
    this.items.set(await this.admin.messages(status === '' ? undefined : status));
    this.loading.set(false);
  }

  protected setFilter(value: 'NEW' | '' | 'ARCHIVED'): void {
    this.filter.set(value);
    this.openId.set(null);
    void this.load();
  }

  /** Açılan mesaj okundu sayılır; listede okunmamış olarak kalmasın. */
  protected async toggle(item: Message): Promise<void> {
    const opening = this.openId() !== item.id;
    this.openId.set(opening ? item.id : null);

    if (opening && item.status === 'NEW') {
      await this.admin.setMessageStatus(item.id, 'READ');
      this.items.update((list) =>
        list.map((row) => (row.id === item.id ? { ...row, status: 'READ' as const } : row))
      );
    }
  }

  protected async setStatus(item: Message, status: MessageStatus): Promise<void> {
    await this.admin.setMessageStatus(item.id, status);
    this.openId.set(null);
    await this.load();
  }

  protected askDelete(item: Message): void {
    this.target = item;
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteMessage(this.target.id);
    this.target = null;
    await this.load();
  }

  /** "3 saat önce" gibi kısa gösterim. */
  protected when(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} gün önce`;
    return new Date(iso).toLocaleDateString('tr-TR');
  }

  protected fullDate(iso: string): string {
    return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' });
  }
}
