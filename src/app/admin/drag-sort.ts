import { signal } from '@angular/core';

/**
 * Listede sürükleyerek sıralama. Hazır bir sürükle-bırak kütüphanesi
 * yerine tarayıcının kendi HTML5 sürükleme olayları kullanılıyor.
 *
 * Kullanan ekran öğeleri kendi tutar; bu sınıf yalnızca hangi satırın
 * sürüklendiğini ve nereye bırakılacağını izler, sırayı hesaplayıp
 * geri verir.
 *
 *   private readonly sorter = new DragSort<Category>(
 *     () => this.items(),
 *     (next) => { this.items.set(next); return this.admin.reorderCategories(...); }
 *   );
 */
export class DragSort<T> {
  /** Sürüklenen satırın sırası; sürükleme yokken null. */
  readonly dragging = signal<number | null>(null);
  /** Üzerine gelinen satır — araya çizgi çizmek için. */
  readonly over = signal<number | null>(null);

  constructor(
    private readonly read: () => T[],
    private readonly commit: (next: T[]) => void | Promise<unknown>
  ) {}

  start(index: number): void {
    this.dragging.set(index);
  }

  /** Sürükleme sırasında: bırakmaya izin ver ve hedefi işaretle. */
  enter(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.dragging() !== null) this.over.set(index);
  }

  leave(index: number): void {
    if (this.over() === index) this.over.set(null);
  }

  /** Bırakıldığında yeni sırayı hesaplar ve kaydeder. */
  drop(index: number, event: DragEvent): void {
    event.preventDefault();
    const from = this.dragging();
    this.reset();
    if (from === null || from === index) return;
    void this.commit(this.moved(from, index));
  }

  /** Klavyeyle taşıma — sürükleyemeyenler için aynı işi yapar. */
  moveBy(index: number, direction: -1 | 1): number | null {
    const target = index + direction;
    if (target < 0 || target >= this.read().length) return null;
    void this.commit(this.moved(index, target));
    return target;
  }

  reset(): void {
    this.dragging.set(null);
    this.over.set(null);
  }

  private moved(from: number, to: number): T[] {
    const next = [...this.read()];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }
}
