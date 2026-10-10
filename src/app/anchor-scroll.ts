import { DestroyRef, inject } from '@angular/core';
import { Router, Scroll } from '@angular/router';

/**
 * Rota değişince kaydırmayı biz yönetiriz. CSS'teki `scroll-behavior: smooth`
 * hızı tarayıcıya bırakıyor ve sayfa geçişinde en üste dönüşü de
 * animasyonlu yapıyordu; burada süre bizde, sayfa geçişi anında.
 *
 * - `#bolum` linkleri: sabit header'ın altına yumuşakça iner.
 * - Diğer geçişler: anında en üste.
 * - Panelde ve "hareketi azalt" açıkken animasyon yok.
 */
export function setupAnchorScroll(): void {
  const router = inject(Router);
  let cancel: (() => void) | undefined;

  const subscription = router.events.subscribe((event) => {
    if (!(event instanceof Scroll)) return;
    cancel?.();

    if (!event.anchor) {
      window.scrollTo(0, 0);
      return;
    }

    const animate =
      !router.url.startsWith('/admin') &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancel = scrollToAnchor(event.anchor, animate);
  });

  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
}

/**
 * Bölüm başka sayfadaysa içerik API'den gelip yerleşene kadar bekler:
 * konumu birkaç kare boyunca değişmeyince kaydırmaya başlar.
 */
function scrollToAnchor(id: string, animate: boolean): () => void {
  let frame = 0;
  let tries = 0;
  let lastTop: number | undefined;
  let stableFrames = 0;
  let stopAnimation: (() => void) | undefined;

  const targetTop = (target: HTMLElement) => {
    const header = document.querySelector('app-header header');
    const offset = header?.getBoundingClientRect().height ?? 0;
    return target.getBoundingClientRect().top + window.scrollY - offset;
  };

  const wait = () => {
    const target = document.getElementById(id);
    const top = target ? targetTop(target) : undefined;
    stableFrames = top !== undefined && top === lastTop ? stableFrames + 1 : 0;
    lastTop = top;

    if (!target || (stableFrames < 5 && ++tries < 90)) {
      frame = requestAnimationFrame(wait);
      return;
    }
    if (animate) stopAnimation = animateScroll(() => targetTop(target));
    else window.scrollTo(0, targetTop(target));
  };
  wait();

  return () => {
    cancelAnimationFrame(frame);
    stopAnimation?.();
  };
}

/** Hedef her karede yeniden okunur; geç yüklenen görsel araya girse de doğru yere iner. */
function animateScroll(to: () => number): () => void {
  const from = window.scrollY;
  const distance = to() - from;
  // Kısa mesafe hızlı, uzun mesafe biraz daha uzun sürer ama 1,1 sn'yi geçmez.
  const duration = Math.min(1100, 600 + Math.abs(distance) * 0.2);
  const start = performance.now();
  let frame = 0;

  // Kullanıcı tekerleği ya da dokunmatiği kullanırsa animasyon ona bırakır.
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
  };
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo(0, from + (to() - from) * easeInOutCubic(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);

  return stop;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
