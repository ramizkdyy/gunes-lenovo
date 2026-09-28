import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((m) => m.Home),
    title: 'Lenovo ThinkSystem Sunucular',
  },
  // Kategori listesi ana sayfada duruyor; ayrı bir liste sayfası tekrar
  // olurdu. Eski bağlantılar ana sayfadaki bölüme düşsün.
  { path: 'kategoriler', redirectTo: '/', pathMatch: 'full' },
  {
    // `withComponentInputBinding` sayesinde :slug bileşene input olarak geçer.
    path: 'kategoriler/:slug',
    loadComponent: () => import('./pages/category-detail').then((m) => m.CategoryDetail),
  },
  {
    path: 'kategoriler/:categorySlug/:slug',
    loadComponent: () => import('./pages/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'teklif',
    loadComponent: () => import('./pages/quote').then((m) => m.Quote),
    title: 'Teklif Alın',
  },
  {
    // Panel tamamen ayrı: kendi düzeni, kendi oturumu.
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  { path: '**', redirectTo: '' },
];
