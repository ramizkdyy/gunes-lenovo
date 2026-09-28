import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mediaSrcsetSteps, mediaUrl } from '../api/media';
import { ContactService } from '../api/contact.service';
import { ContentService } from '../api/content.service';
import type { HeroSlide } from '../api/models';

/**
 * Üst üste yığılan tam ekran paneller. İçerik API'deki hero panellerinden
 * gelir; sıra, metin, görsel ve tema panelden değiştirilir.
 *
 * Her panel `position: sticky; top: 0; height: 100dvh`. Kaydırdıkça
 * üstteki panel yerinde kalır, bir sonraki alttan gelip üzerini örter.
 *
 * Temalar:
 *  - `dark`         görsel tam ekran arka plan, üstünde karartma (fotoğraf için)
 *  - `dark-product` koyu zemin, metin solda, ürün sağda (şeffaf ürün görseli için)
 *  - `light`        beyaz zemin, metin solda, ürün sağda
 */
@Component({
  selector: 'app-hero',
  imports: [AsyncPipe, RouterLink, NgTemplateOutlet],
  template: `
    <!-- Her temada aynı buton: teklif adresi dialog açar, diğerleri bağlantıdır. -->
    <ng-template #cta let-slide>
      @if (slide.ctaHref) {
        @if (isQuote(slide.ctaHref)) {
          <button type="button" [class]="ctaClass" (click)="contact.openFor()">
            {{ slide.ctaLabel }}
          </button>
        } @else {
          <a
            [routerLink]="linkPath(slide.ctaHref)"
            [fragment]="linkFragment(slide.ctaHref)"
            [class]="ctaClass"
          >
            {{ slide.ctaLabel }}
          </a>
        }
      }
    </ng-template>

    <div class="relative">
      @for (slide of slides$ | async; track slide.id; let first = $first) {
        @if (slide.theme === 'dark') {
          <!-- Fotoğraflı koyu panel: görsel arka planda, üstünde karartma -->
          <section class="sticky top-0 flex h-dvh items-center overflow-hidden bg-[var(--color-ink)]">
            <img
              [src]="bg(slide)"
              [attr.srcset]="bgSrcset(slide)"
              sizes="100vw"
              alt=""
              aria-hidden="true"
              [attr.fetchpriority]="first ? 'high' : null"
              [attr.loading]="first ? null : 'lazy'"
              class="absolute inset-0 h-full w-full object-cover object-right"
            />
            <div
              class="absolute inset-0"
              style="background: linear-gradient(90deg,#08090a 0%,#08090a 38%,rgba(8,9,10,0.82) 58%,rgba(8,9,10,0.15) 100%)"
              aria-hidden="true"
            ></div>

            <div class="relative mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6">
              @if (slide.eyebrow) {
                <p class="kicker text-white/60">{{ slide.eyebrow }}</p>
              }
              <h2 class="display mt-5 max-w-[15ch] text-[clamp(2.2rem,5vw,3.6rem)] text-balance text-white">
                {{ slide.title }}
              </h2>
              <p class="mt-5 max-w-[50ch] text-[16.5px] leading-[1.7] text-white/75">{{ slide.body }}</p>
              <div class="mt-9">
                <ng-container *ngTemplateOutlet="cta; context: { $implicit: slide }" />
              </div>
            </div>

            @if (first) {
              <span class="absolute bottom-7 left-1/2 -translate-x-1/2 text-[12px] tracking-wide text-white/40" aria-hidden="true">
                Kaydırın
              </span>
            }
          </section>
        } @else {
          <!-- Ürünlü panel: metin solda, ürün sağda. Açık ve koyu zemin aynı düzen. -->
          @let dark = slide.theme === 'dark-product';
          <section
            class="sticky top-0 flex h-dvh items-center overflow-hidden"
            [class]="dark ? 'bg-[var(--color-ink)]' : 'bg-white'"
            [style.background]="dark ? stageBackground : null"
          >
            <div class="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 pt-16 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
              <div>
                @if (slide.eyebrow) {
                  <p class="kicker" [class]="dark ? 'text-white/60' : ''">{{ slide.eyebrow }}</p>
                }
                <h2
                  class="display mt-3 max-w-[16ch] text-balance"
                  [class]="dark ? 'text-white text-[clamp(2.2rem,5vw,3.6rem)]' : 'text-[clamp(1.9rem,4vw,3rem)]'"
                >
                  {{ slide.title }}
                </h2>
                <p
                  class="mt-5 max-w-[48ch] text-[16px] leading-[1.7]"
                  [class]="dark ? 'text-white/70' : 'text-[var(--fg-soft)]'"
                >
                  {{ slide.body }}
                </p>
                <div class="mt-8">
                  <ng-container *ngTemplateOutlet="cta; context: { $implicit: slide }" />
                </div>
              </div>

              <img
                [src]="product(slide)"
                [attr.srcset]="productSrcset(slide)"
                sizes="(min-width: 1024px) 55vw, 100vw"
                [alt]="slide.title"
                [attr.fetchpriority]="first ? 'high' : null"
                [attr.loading]="first ? null : 'lazy'"
                class="h-auto max-h-[62dvh] w-full object-contain"
              />
            </div>

            @if (first) {
              <span
                class="absolute bottom-7 left-1/2 -translate-x-1/2 text-[12px] tracking-wide"
                [class]="dark ? 'text-white/40' : 'text-[var(--fg-soft)]'"
                aria-hidden="true"
              >
                Kaydırın
              </span>
            }
          </section>
        }
      }
    </div>
  `,
})
export class Hero {
  private readonly content = inject(ContentService);
  protected readonly contact = inject(ContactService);

  protected readonly slides$ = this.content.heroSlides();

  protected readonly ctaClass =
    'inline-block rounded-md bg-[var(--color-brand-500)] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]';

  /**
   * Ürünlü koyu panelin zemini: ürün fotoğrafçılığındaki gibi arkadan
   * hafif, nötr bir ışık ve yukarıdan aşağı koyulaşan zemin. Renkli ya da
   * geniş bir parıltı değil — ürünü öne çıkarsın, kendisi göze batmasın.
   */
  protected readonly stageBackground =
    'radial-gradient(45% 50% at 72% 55%, rgba(255,255,255,0.07), transparent 70%),' +
    'linear-gradient(180deg, #111214 0%, #08090a 55%, #050506 100%)';

  /** "/teklif" formu açar, sayfaya gitmez. */
  protected isQuote = (href: string) => href.split('#')[0] === '/teklif';

  /** Buton adresi "/#urunler" gibi çapa içerebilir; router'a yol ve çapa ayrı verilmeli. */
  protected linkPath = (href: string) => (href || '/').split('#')[0] || '/';
  protected linkFragment = (href: string) => (href || '').split('#')[1] || undefined;

  /** Tam ekran arka plan: geniş ve kırpılmış. */
  protected bg = (slide: HeroSlide) => mediaUrl(slide.imageId, { width: 1920, fit: 'cover' });

  /**
   * Retina ekranda tam ekran görsel pencerenin 2 katı piksel ister;
   * tek boyut gönderilince büyütülüp bulanıklaşıyordu.
   */
  protected bgSrcset = (slide: HeroSlide) =>
    mediaSrcsetSteps(slide.imageId, [1280, 1920, 2560, 3000], { fit: 'cover' });

  /** Yan yana yerleşimdeki ürün görseli: kırpılmadan sığdırılır. */
  protected product = (slide: HeroSlide) => mediaUrl(slide.imageId, { width: 1200, fit: 'contain' });

  protected productSrcset = (slide: HeroSlide) =>
    mediaSrcsetSteps(slide.imageId, [800, 1200, 1800, 2400], { fit: 'contain' });
}
