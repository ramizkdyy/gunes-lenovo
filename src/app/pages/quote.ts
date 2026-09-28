import { Component, inject } from '@angular/core';
import { ContactForm } from '../components/contact-form';

/** Teklif sayfası: formun tam boy hali. */
@Component({
  selector: 'app-quote',
  imports: [ContactForm],
  template: `
    <section class="mx-auto w-full max-w-[720px] px-4 pt-32 pb-28 sm:px-6">
      <p class="kicker">Teklif</p>
      <h1 class="display mt-3 text-[clamp(1.9rem,4vw,3rem)] text-balance">
        İhtiyacınızı yazın, biz yapılandıralım
      </h1>
      <p class="mt-5 text-[16px] leading-[1.7] text-[var(--fg-soft)]">
        Kaç kullanıcı, hangi uygulama, ne kadar depolama.
      </p>

      <div class="mt-10">
        <app-contact-form />
      </div>

      <p class="mt-8 text-[14px] text-[var(--fg-soft)]">
        Telefonla ulaşmak isterseniz:
        <a href="tel:+903423255555" class="font-medium text-[var(--fg)] hover:text-[var(--color-brand-500)]">
          +90 342 325 55 55
        </a>
      </p>
    </section>
  `,
})
export class Quote {
}
