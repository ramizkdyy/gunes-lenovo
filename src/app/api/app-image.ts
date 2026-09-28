import { Component, computed, input } from '@angular/core';
import { mediaSrcset, mediaUrl, PLACEHOLDER } from './media';

/**
 * API'den gelen görseli doğru boyutta gösterir, yoksa yer tutucuya düşer.
 *
 *   <app-image [id]="cat.imageId" [width]="460" [alt]="ad" />
 */
@Component({
  selector: 'app-image',
  template: `
    <img
      [src]="src()"
      [attr.srcset]="srcset()"
      [attr.sizes]="sizes() || null"
      [alt]="alt()"
      [attr.width]="width()"
      [attr.height]="height() || null"
      [attr.loading]="priority() ? null : 'lazy'"
      [attr.fetchpriority]="priority() ? 'high' : null"
      [attr.decoding]="priority() ? null : 'async'"
      [class]="imgClass()"
    />
  `,
})
export class AppImage {
  /** Görsel kimliği. Boşsa yer tutucu gösterilir. */
  readonly id = input<string | null>(null);
  readonly width = input.required<number>();
  readonly height = input<number | null>(null);
  readonly alt = input('');
  readonly fit = input<'cover' | 'contain' | 'inside'>('contain');
  /** Ekranda kapladığı genişlik (ör. `(min-width: 768px) 33vw, 100vw`). */
  readonly sizes = input('');
  /** Ekranın üstündeki görseller için: lazy yükleme kapatılır. */
  readonly priority = input(false);
  readonly imgClass = input('');

  protected readonly src = computed(() =>
    this.id()
      ? mediaUrl(this.id(), { width: this.width(), height: this.height() ?? undefined, fit: this.fit() })
      : PLACEHOLDER
  );

  protected readonly srcset = computed(() =>
    mediaSrcset(this.id(), this.width(), { height: this.height() ?? undefined, fit: this.fit() })
  );
}
