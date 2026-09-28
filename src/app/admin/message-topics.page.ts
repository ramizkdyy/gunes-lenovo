import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { DragHandle } from './drag-handle';
import { DragSort } from './drag-sort';
import { INPUT_CLASS, errorMessage } from './shared';
import { UiConfirm } from './ui';
import type { MessageTopicAdmin } from '../api/models';

/**
 * Formdaki "Konu" listesi. Ziyaretçinin ne için yazdığını buradan
 * belirliyoruz; sıra formda göründüğü sıradır.
 */
@Component({
  selector: 'app-admin-message-topics',
  imports: [FormsModule, DragHandle, UiConfirm],
  template: `
    <div class="mx-auto w-full max-w-[820px] px-6 py-10">
      <h1 class="text-[22px] font-semibold">Mesaj konuları</h1>
      <p class="mt-1 text-[14px] leading-[1.6] text-[var(--fg-soft)]">
        Sitedeki formda "Konu" listesinde çıkan seçenekler. Taşımak için sürükleyin.
        Pasife aldığınız konu formda görünmez ama eski mesajlarda adı korunur.
      </p>

      <form class="mt-8 flex flex-wrap gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-4" (ngSubmit)="add()">
        <input
          name="newLabel"
          [(ngModel)]="newLabel"
          [class]="inputClass + ' flex-1 min-w-[240px]'"
          placeholder="Yeni konu ekleyin — ör. Kiralama seçenekleri"
        />
        <button
          type="submit"
          [disabled]="busy()"
          class="rounded-md bg-[var(--color-brand-500)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-60"
        >
          Ekle
        </button>
      </form>

      @if (error()) {
        <p class="mt-4 rounded-md bg-[var(--color-brand-050)] px-4 py-3 text-[13.5px] text-[var(--color-brand-600)]">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <p class="mt-8 text-[var(--fg-soft)]">Yükleniyor…</p>
      } @else {
        <ul class="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-white">
          @for (topic of items(); track topic.id; let i = $index) {
            <li
              class="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 transition-colors last:border-b-0"
              [class]="rowClass(i)"
              (dragover)="sorter.enter(i, $event)"
              (dragleave)="sorter.leave(i)"
              (drop)="sorter.drop(i, $event)"
            >
              <ui-drag-handle
                draggable="true"
                [label]="topic.label"
                (dragstart)="sorter.start(i)"
                (dragend)="sorter.reset()"
                (moveUp)="sorter.moveBy(i, -1)"
                (moveDown)="sorter.moveBy(i, 1)"
              />

              <input
                [name]="'label' + topic.id"
                [(ngModel)]="topic.label"
                (blur)="save(topic)"
                class="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1.5 text-[14.5px] outline-none hover:border-[var(--line)] focus:border-[var(--fg)]"
                [class]="topic.active ? '' : 'line-through text-[var(--fg-soft)]'"
              />

              @if (topic._count?.messages) {
                <span class="shrink-0 text-[12.5px] text-[var(--fg-soft)]">
                  {{ topic._count?.messages }} mesaj
                </span>
              }

              <button
                type="button"
                class="shrink-0 px-2 text-[13px] text-[var(--fg-soft)] hover:text-[var(--fg)]"
                (click)="toggleActive(topic)"
              >
                {{ topic.active ? 'Pasife al' : 'Aktif et' }}
              </button>

              <button
                type="button"
                class="shrink-0 px-2 text-[13px] text-[var(--fg-soft)] hover:text-[var(--color-brand-500)]"
                (click)="askDelete(topic)"
              >
                Sil
              </button>
            </li>
          }
        </ul>
      }

      <ui-confirm title="Konu silinsin mi?" [message]="deleteMessage()" (confirmed)="remove()" />
    </div>
  `,
})
export class AdminMessageTopics {
  private readonly admin = inject(AdminService);

  protected readonly inputClass = INPUT_CLASS;
  protected readonly items = signal<MessageTopicAdmin[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly deleteMessage = signal('');
  protected newLabel = '';

  private readonly confirm = viewChild.required(UiConfirm);
  private target: MessageTopicAdmin | null = null;

  protected readonly sorter = new DragSort<MessageTopicAdmin>(
    () => this.items(),
    async (next) => {
      this.items.set(next);
      await this.admin.reorderMessageTopics(next.map((item, index) => ({ id: item.id, sort: index })));
    }
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.items.set(await this.admin.messageTopics());
    this.loading.set(false);
  }

  protected rowClass(index: number): string {
    if (this.sorter.dragging() === index) return 'opacity-40';
    if (this.sorter.over() === index) return 'bg-[var(--color-n-025)]';
    return '';
  }

  protected async add(): Promise<void> {
    const label = this.newLabel.trim();
    if (!label) return;

    this.error.set('');
    this.busy.set(true);
    try {
      await this.admin.createMessageTopic({ label: label, sort: this.items().length });
      this.newLabel = '';
      await this.load();
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.busy.set(false);
    }
  }

  protected async save(topic: MessageTopicAdmin): Promise<void> {
    this.error.set('');
    try {
      await this.admin.updateMessageTopic(topic.id, {
        label: topic.label,
        sort: topic.sort,
        active: topic.active,
      });
    } catch (err) {
      this.error.set(errorMessage(err));
      await this.load();
    }
  }

  protected async toggleActive(topic: MessageTopicAdmin): Promise<void> {
    topic.active = !topic.active;
    await this.save(topic);
  }

  protected askDelete(topic: MessageTopicAdmin): void {
    this.target = topic;
    const count = topic._count?.messages ?? 0;
    this.deleteMessage.set(
      count
        ? `"${topic.label}" silinecek. ${count} mesaj bu konuda yazılmış; mesajlar durur, konu adı onlarda saklı kalır.`
        : `"${topic.label}" silinecek.`
    );
    this.confirm().ask();
  }

  protected async remove(): Promise<void> {
    if (!this.target) return;
    await this.admin.deleteMessageTopic(this.target.id);
    this.target = null;
    await this.load();
  }
}
