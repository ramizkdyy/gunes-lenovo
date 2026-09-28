import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Panel isteklerine oturum jetonunu ekler. Jeton geçersizse
 * (401) oturumu kapatıp giriş ekranına döner.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAdminRequest = req.url.startsWith(`${environment.apiUrl}/admin`);
  const token = auth.token;

  const request =
    isAdminRequest && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isAdminRequest) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
