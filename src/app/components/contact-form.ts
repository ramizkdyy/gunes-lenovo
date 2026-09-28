import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { ContactService, type MessageTopic } from '../api/contact.service';

/**
 * Teklif/iletişim formu. İki yerde kullanılıyor: teklif dialog'unda ve
 * /teklif sayfasında gömülü olarak. Alanlar spartan/ui (shadcn) bileşenleri.
 */
@Component({
  selector: 'app-contact-form',
  imports: [FormsModule, HlmButton, HlmInput, HlmLabel, HlmTextarea, HlmSelectImports],
  template: `
    @if (sent()) {
      <div class="py-6 text-center">
        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h3 class="mt-4 text-[17px] font-semibold">Mesajınız bize ulaştı</h3>
        <p class="mt-1.5 text-sm text-muted-foreground">Aynı gün içinde size dönüş yapacağız.</p>
        <button hlmBtn variant="ghost" class="mt-4" type="button" (click)="reset()">
          Yeni mesaj yaz
        </button>
      </div>
    } @else {
      <form class="grid gap-4" (ngSubmit)="submit()">
        @if (contact.product(); as product) {
          <p class="rounded-md bg-muted px-3 py-2.5 text-sm">
            İlgilendiğiniz ürün: <span class="font-semibold">{{ product.model }}</span>
          </p>
        }

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <label hlmLabel for="cf-name">Ad Soyad</label>
            <input hlmInput id="cf-name" name="name" autocomplete="name" [(ngModel)]="draft.name" />
          </div>
          <div class="grid gap-2">
            <label hlmLabel for="cf-company">
              Firma <span class="font-normal text-muted-foreground">(isteğe bağlı)</span>
            </label>
            <input hlmInput id="cf-company" name="company" autocomplete="organization" [(ngModel)]="draft.company" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <label hlmLabel for="cf-phone">Telefon</label>
            <input hlmInput id="cf-phone" name="phone" type="tel" autocomplete="tel" [(ngModel)]="draft.phone" />
          </div>
          <div class="grid gap-2">
            <label hlmLabel for="cf-email">E-posta</label>
            <input hlmInput id="cf-email" name="email" type="email" autocomplete="email" [(ngModel)]="draft.email" />
          </div>
        </div>
        <p class="-mt-2 text-xs text-muted-foreground">Telefon ya da e-postadan en az birini yazın.</p>

        <div class="grid gap-2">
          <label hlmLabel>Konu</label>
          <hlm-select name="topic" [(ngModel)]="topic" [itemToString]="topicLabel">
            <hlm-select-trigger class="w-full">
              <hlm-select-value placeholder="Seçin…" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (item of topics(); track item.id) {
                <hlm-select-item [value]="item">{{ item.label }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>

        <div class="grid gap-2">
          <label hlmLabel for="cf-body">Mesajınız</label>
          <textarea
            hlmTextarea
            id="cf-body"
            name="body"
            rows="4"
            class="min-h-28"
            placeholder="Kaç kullanıcı, hangi uygulama, ne kadar depolama"
            [(ngModel)]="draft.body"
          ></textarea>
        </div>

        @if (error()) {
          <p class="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
            {{ error() }}
          </p>
        }

        <button hlmBtn type="submit" size="lg" class="w-full" [disabled]="busy()">
          {{ busy() ? 'Gönderiliyor…' : 'Gönder' }}
        </button>
      </form>
    }
  `,
})
export class ContactForm {
  /** Dialog içinde daha sıkı, sayfada daha ferah durması için ayrılmış. */
  readonly compact = input(false);

  protected readonly contact = inject(ContactService);

  protected readonly topics = signal<MessageTopic[]>([]);
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal('');

  protected draft = this.emptyDraft();
  /** Seçilen konu — select nesnenin kendisini tutuyor, adı itemToString'den. */
  protected topic: MessageTopic | null = null;
  protected readonly topicLabel = (topic: MessageTopic | null) => topic?.label ?? '';

  constructor() {
    void this.contact.topics().then((topics) => this.topics.set(topics));
  }

  private emptyDraft() {
    return { name: '', company: '', phone: '', email: '', body: '' };
  }

  protected reset(): void {
    this.draft = this.emptyDraft();
    this.topic = null;
    this.sent.set(false);
    this.error.set('');
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    this.busy.set(true);
    try {
      await this.contact.send({
        ...this.draft,
        topicId: this.topic?.id,
        productId: this.contact.product()?.id,
        sourcePath: location.pathname,
      });
      this.sent.set(true);
    } catch (err) {
      const message = (err as { error?: { message?: string | string[] } })?.error?.message;
      this.error.set(
        Array.isArray(message)
          ? message.join('. ')
          : (message ?? 'Gönderilemedi, birazdan tekrar deneyin.')
      );
    } finally {
      this.busy.set(false);
    }
  }
}
