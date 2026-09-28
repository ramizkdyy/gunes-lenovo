import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

/** Panel girişi. Siteden bağımsız, sade bir ekran. */
@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-[var(--color-n-050)] px-4">
      <form
        class="w-full max-w-[380px] rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-8"
        (ngSubmit)="submit()"
      >
        <h1 class="text-[20px] font-semibold">Yönetim paneli</h1>
        <p class="mt-1.5 text-[14px] text-[var(--fg-soft)]">İçerik girişi için oturum açın.</p>

        <label class="mt-7 block">
          <span class="mb-1.5 block text-[13px] font-medium">E-posta</span>
          <input
            name="email"
            type="email"
            autocomplete="username"
            required
            [(ngModel)]="email"
            class="w-full rounded-md border border-[var(--line)] px-3 py-2.5 text-[14.5px] outline-none focus:border-[var(--fg)]"
          />
        </label>

        <label class="mt-4 block">
          <span class="mb-1.5 block text-[13px] font-medium">Şifre</span>
          <input
            name="password"
            type="password"
            autocomplete="current-password"
            required
            [(ngModel)]="password"
            class="w-full rounded-md border border-[var(--line)] px-3 py-2.5 text-[14.5px] outline-none focus:border-[var(--fg)]"
          />
        </label>

        @if (error()) {
          <p class="mt-4 rounded-md bg-[var(--color-brand-050)] px-3 py-2.5 text-[13.5px] text-[var(--color-brand-600)]">
            {{ error() }}
          </p>
        }

        <button
          type="submit"
          [disabled]="busy()"
          class="mt-6 w-full rounded-md bg-[var(--color-brand-500)] px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)] disabled:opacity-60"
        >
          {{ busy() ? 'Giriş yapılıyor…' : 'Giriş yap' }}
        </button>
      </form>
    </div>
  `,
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected async submit(): Promise<void> {
    this.error.set('');
    this.busy.set(true);
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigate(['/admin']);
    } catch (err) {
      this.error.set(
        err instanceof HttpErrorResponse && err.status === 401
          ? 'E-posta veya şifre hatalı'
          : 'Sunucuya ulaşılamadı. API çalışıyor mu?'
      );
    } finally {
      this.busy.set(false);
    }
  }
}
