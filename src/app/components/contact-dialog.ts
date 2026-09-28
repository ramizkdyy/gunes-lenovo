import { Component } from '@angular/core';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { ContactForm } from './contact-form';

/** Teklif dialog'unun içi — ContactService.openFor() ile açılır. */
@Component({
  selector: 'app-contact-dialog',
  imports: [HlmDialogImports, ContactForm],
  host: { class: 'grid gap-6' },
  template: `
    <hlm-dialog-header class="pr-8">
      <h2 hlmDialogTitle class="text-xl font-semibold tracking-tight">İhtiyacınızı yazın</h2>
      <!-- hlmDialogDescription yerine sabit id: yönerge kendi id'sini dialog
           açıldıktan sonra atıyor ve Angular bunu değişiklik hatası sayıyor.
           aria-describedby'ı dialog açılırken ContactService veriyor. -->
      <p id="contact-dialog-desc" class="text-sm text-muted-foreground">
        Uygun modeli ve fiyatı aynı gün içinde iletelim.
      </p>
    </hlm-dialog-header>
    <app-contact-form [compact]="true" />
  `,
})
export class ContactDialog {}
