import { Component, ElementRef, input, model, viewChildren } from '@angular/core';
import { DragHandle } from './drag-handle';
import { DragSort } from './drag-sort';
import { INPUT_CLASS } from './shared';
import type { Spec } from '../api/models';

/**
 * Özellik satırları: başlık + değer, eklenir, silinir, sürüklenerek
 * sıralanır. Kategori şablonunda yalnızca başlık düzenlenir
 * (`withValues` kapalı), değer kutusu görünmez.
 *
 * Kutular ngModel yerine [value]/(input) ile bağlı: üst formda `name`
 * istemeden, satır eklenip silindikçe form kaydı tutmadan çalışsın diye.
 */
@Component({
  selector: 'app-spec-editor',
  imports: [DragHandle],
  template: `
    @if (rows().length) {
      <ul class="space-y-2">
        @for (row of rows(); track $index; let i = $index) {
          <li
            class="grid items-center gap-2 rounded-md transition-colors"
            [class]="rowClass(i)"
            (dragover)="sorter.enter(i, $event)"
            (dragleave)="sorter.leave(i)"
            (drop)="sorter.drop(i, $event)"
          >
            <ui-drag-handle
              draggable="true"
              [label]="row.label || 'Satır ' + (i + 1)"
              (dragstart)="sorter.start(i)"
              (dragend)="sorter.reset()"
              (moveUp)="sorter.moveBy(i, -1)"
              (moveDown)="sorter.moveBy(i, 1)"
            />
            <input
              #label
              [value]="row.label"
              (input)="update(i, 'label', $any($event.target).value)"
              [class]="inputClass + ' font-medium'"
              placeholder="Başlık, ör. İşlemci"
              aria-label="Özellik başlığı"
            />
            @if (withValues()) {
              <input
                [value]="row.value"
                (input)="update(i, 'value', $any($event.target).value)"
                [class]="inputClass"
                placeholder="Değer"
                [attr.aria-label]="(row.label || 'Özellik') + ' değeri'"
              />
            }
            <button
              type="button"
              class="rounded px-2 py-2 text-[18px] leading-none text-[var(--color-n-400)] hover:text-[var(--color-brand-500)]"
              [attr.aria-label]="(row.label || 'Satırı') + ' sil'"
              title="Satırı sil"
              (click)="remove(i)"
            >
              ×
            </button>
          </li>
        }
      </ul>
    } @else {
      <p class="text-[13.5px] text-[var(--fg-soft)]">Henüz satır yok.</p>
    }

    <button
      type="button"
      class="mt-3 rounded-md border border-dashed border-[var(--line-strong)] px-4 py-2 text-[13.5px] font-medium text-[var(--fg-soft)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
      (click)="add()"
    >
      + Satır ekle
    </button>
  `,
})
export class SpecEditor {
  readonly rows = model<Spec[]>([]);
  /** Kapalıysa yalnızca başlıklar düzenlenir (kategori şablonu). */
  readonly withValues = input(true);

  protected readonly inputClass = INPUT_CLASS;
  private readonly labels = viewChildren<ElementRef<HTMLInputElement>>('label');

  protected readonly sorter = new DragSort<Spec>(
    () => this.rows(),
    (next) => this.rows.set(next)
  );

  /** Sürüklenen satır soluklaşır, bırakılacak satır vurgulanır. */
  protected rowClass(index: number): string {
    const columns = this.withValues() ? 'grid-cols-[auto_minmax(0,200px)_1fr_auto]' : 'grid-cols-[auto_1fr_auto]';
    if (this.sorter.dragging() === index) return `${columns} opacity-40`;
    if (this.sorter.over() === index) return `${columns} bg-[var(--color-n-025)]`;
    return columns;
  }

  protected update(index: number, key: keyof Spec, value: string): void {
    this.rows.set(this.rows().map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  protected add(): void {
    this.rows.set([...this.rows(), { label: '', value: '' }]);
    // Yeni satırın başlık kutusuna odaklan; hemen yazmaya başlansın.
    setTimeout(() => this.labels().at(-1)?.nativeElement.focus());
  }

  protected remove(index: number): void {
    this.rows.set(this.rows().filter((_, i) => i !== index));
  }
}
