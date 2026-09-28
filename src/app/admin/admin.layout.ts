import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminService } from './admin.service';
import { AuthService } from './auth.service';

/** Panelin kabuğu: solda gezinme, sağda içerik. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-dvh bg-[var(--color-n-050)]">
      <aside class="hidden w-60 shrink-0 flex-col border-r border-[var(--line)] bg-white md:flex">
        <div class="border-b border-[var(--line)] px-5 py-5">
          <p class="text-[15px] font-semibold">Yönetim</p>
          <p class="mt-0.5 text-[12.5px] text-[var(--fg-soft)]">{{ auth.user()?.name }}</p>
        </div>

        <nav class="flex-1 p-3">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-[var(--color-n-050)] text-[var(--fg)] font-semibold"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="mb-1 block rounded-md px-3 py-2.5 text-[14px] text-[var(--fg-soft)] transition-colors hover:bg-[var(--color-n-025)]"
            >
              {{ item.label }}
              @if (item.badge && unread()) {
                <span class="ml-2 rounded-full bg-[var(--color-brand-500)] px-2 py-0.5 text-[11.5px] font-semibold text-white">
                  {{ unread() }}
                </span>
              }
            </a>
          }
        </nav>

        <div class="border-t border-[var(--line)] p-3">
          <a
            href="/"
            target="_blank"
            class="mb-1 block rounded-md px-3 py-2.5 text-[14px] text-[var(--fg-soft)] transition-colors hover:bg-[var(--color-n-025)]"
          >
            Siteyi aç ↗
          </a>
          <button
            type="button"
            class="block w-full rounded-md px-3 py-2.5 text-left text-[14px] text-[var(--fg-soft)] transition-colors hover:bg-[var(--color-n-025)]"
            (click)="auth.logout()"
          >
            Çıkış yap
          </button>
        </div>
      </aside>

      <!-- Dar ekranda kenar çubuğu üstte yatay şeride dönüşür -->
      <nav class="fixed inset-x-0 top-0 z-40 flex gap-1 overflow-x-auto border-b border-[var(--line)] bg-white px-3 py-2 md:hidden">
        @for (item of nav; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-[var(--color-n-050)] font-semibold"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="shrink-0 rounded-md px-3 py-2 text-[13.5px] text-[var(--fg-soft)]"
          >
            {{ item.label }}
            @if (item.badge && unread()) {
              <span class="ml-1 font-semibold text-[var(--color-brand-500)]">{{ unread() }}</span>
            }
          </a>
        }
        <button type="button" class="ml-auto shrink-0 px-3 py-2 text-[13.5px]" (click)="auth.logout()">Çıkış</button>
      </nav>

      <main class="min-w-0 flex-1 pt-14 md:pt-0">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);

  private readonly admin = inject(AdminService);

  /** Okunmamış mesaj sayısı — gezinmede rozet olarak görünür. */
  protected readonly unread = signal(0);

  protected readonly nav = [
    { path: '/admin', label: 'Özet', exact: true, badge: false },
    { path: '/admin/mesajlar', label: 'Mesajlar', exact: false, badge: true },
    { path: '/admin/kategoriler', label: 'Kategoriler', exact: false, badge: false },
    { path: '/admin/urunler', label: 'Ürünler', exact: false, badge: false },
    { path: '/admin/hero', label: 'Ana sayfa panelleri', exact: false, badge: false },
    { path: '/admin/gorseller', label: 'Görseller', exact: false, badge: false },
    { path: '/admin/mesaj-konulari', label: 'Mesaj konuları', exact: false, badge: false },
  ];

  constructor() {
    void this.refreshUnread();
    // Panel açıkken yeni mesaj gelirse rozet kendiliğinden güncellensin.
    setInterval(() => void this.refreshUnread(), 60_000);
  }

  private async refreshUnread(): Promise<void> {
    try {
      this.unread.set((await this.admin.unreadCount()).count);
    } catch {
      /* oturum kapanmışsa interceptor zaten giriş ekranına atar */
    }
  }
}
