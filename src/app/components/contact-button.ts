import { Component, inject } from '@angular/core';
import { ContactService } from '../api/contact.service';

/**
 * Sayfanın sağ altında sabit duran teklif butonu. Ziyaretçi hangi
 * sayfada olursa olsun yazabilsin diye site genelinde tek örnek.
 */
@Component({
  selector: 'app-contact-button',
  template: `
    <button
      type="button"
      class="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-[var(--color-brand-500)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[var(--color-brand-600)] sm:bottom-7 sm:right-7"
      [class]="contact.open() ? 'pointer-events-none translate-y-3 opacity-0' : 'opacity-100'"
      [attr.aria-hidden]="contact.open()"
      [attr.tabindex]="contact.open() ? -1 : 0"
      (click)="contact.openFor()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.6 8.6 0 01-3.8-.9L3 20.5l1.5-4.6A8.4 8.4 0 0112 3.1a8.4 8.4 0 019 8.4z"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Teklif alın
    </button>
  `,
})
export class ContactButton {
  protected readonly contact = inject(ContactService);
}
