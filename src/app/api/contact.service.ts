import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject, signal } from '@angular/core';
import { firstValueFrom, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MessageTopic {
  id: number;
  label: string;
}

export interface MessageDraft {
  name: string;
  company: string;
  phone: string;
  email: string;
  body: string;
  topicId?: number;
  productId?: number;
  sourcePath: string;
}

/**
 * İletişim formu. Form site genelinde tek bir bileşen olduğu için
 * hangi ürün için açıldığını da burası taşıyor.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private readonly injector = inject(Injector);

  /** Dialog açık mı — sabit buton açıkken gizleniyor. */
  readonly open = signal(false);

  /** Form belirli bir ürün sayfasından açıldıysa o ürün. */
  readonly product = signal<{ id: number; model: string } | null>(null);

  private topics$ = this.http
    .get<MessageTopic[]>(`${this.base}/message-topics`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  topics(): Promise<MessageTopic[]> {
    return firstValueFrom(this.topics$);
  }

  /**
   * Teklif dialog'unu açar; ürün verilirse "hangi ürün" alanı hazır gelir.
   * Dialog altyapısı (spartan + CDK, ~200 kB) ve bileşeni ilk açılışta
   * yükleniyor — sayfayı gezen ama formu açmayan ziyaretçi indirmesin diye.
   */
  async openFor(product?: { id: number; model: string }): Promise<void> {
    if (this.open()) return;
    this.product.set(product ?? null);
    this.open.set(true);

    const [{ HlmDialogService }, { ContactDialog }] = await Promise.all([
      import('@spartan-ng/helm/dialog'),
      import('../components/contact-dialog'),
    ]);
    const ref = this.injector.get(HlmDialogService).open(ContactDialog, {
      contentClass: 'sm:max-w-[560px] p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto duration-200',
      closeLabel: 'Kapat',
      ariaDescribedBy: 'contact-dialog-desc',
      // İlk kutuya değil dialog'a odaklan: mobilde klavye açılıp formun
      // yarısını kapatmasın, masaüstünde de ilk alan boşuna vurgulanmasın.
      autoFocus: 'dialog',
    });
    ref.closed$.subscribe(() => this.open.set(false));
  }

  send(draft: MessageDraft): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.post<{ ok: boolean }>(`${this.base}/messages`, draft));
  }
}
