import { Component, input, output } from '@angular/core';

/**
 * Satırı tutup sürüklemek için tutamaç. Klavyeyle odaklanıp
 * yukarı/aşağı ok tuşlarıyla da taşınabilir — sürükleme yapamayan
 * kullanıcı sıralamadan mahrum kalmasın diye.
 */
@Component({
  selector: 'ui-drag-handle',
  template: `
    <span
      tabindex="0"
      role="button"
      class="flex cursor-grab items-center justify-center rounded px-1.5 py-1 text-[var(--color-n-400)] outline-none transition-colors hover:text-[var(--fg-soft)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] active:cursor-grabbing"
      [attr.aria-label]="label() + ' — sürükleyerek ya da yukarı/aşağı ok tuşlarıyla taşıyın'"
      (keydown)="onKeydown($event)"
    >
      <!-- altı nokta: evrensel 'tutup taşı' işareti -->
      <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
        <circle cx="3" cy="15" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
      </svg>
    </span>
  `,
})
export class DragHandle {
  /** Ekran okuyucuya söylenecek satır adı. */
  readonly label = input('Satır');
  readonly moveUp = output<void>();
  readonly moveDown = output<void>();

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveUp.emit();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveDown.emit();
    }
  }
}
