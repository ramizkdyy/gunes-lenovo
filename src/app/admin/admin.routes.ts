import { Routes } from '@angular/router';
import { adminGuard } from './auth.guard';

/**
 * Panel rotaları. Giriş ekranı dışındaki her şey oturum ister;
 * tümü ayrı paket olarak yüklenir, siteyi ziyaret eden panelin
 * kodunu indirmez.
 */
export const adminRoutes: Routes = [
  {
    path: 'giris',
    loadComponent: () => import('./login.page').then((m) => m.AdminLogin),
    title: 'Giriş — Yönetim',
  },
  {
    path: '',
    loadComponent: () => import('./admin.layout').then((m) => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard.page').then((m) => m.AdminDashboard),
        title: 'Özet — Yönetim',
      },
      {
        path: 'kategoriler',
        loadComponent: () => import('./categories.page').then((m) => m.AdminCategories),
        title: 'Kategoriler — Yönetim',
      },
      {
        path: 'kategoriler/:id',
        loadComponent: () => import('./category-form.page').then((m) => m.AdminCategoryForm),
        title: 'Kategori — Yönetim',
      },
      {
        path: 'urunler',
        loadComponent: () => import('./products.page').then((m) => m.AdminProducts),
        title: 'Ürünler — Yönetim',
      },
      {
        path: 'urunler/:id',
        loadComponent: () => import('./product-form.page').then((m) => m.AdminProductForm),
        title: 'Ürün — Yönetim',
      },
      {
        path: 'hero',
        loadComponent: () => import('./hero.page').then((m) => m.AdminHero),
        title: 'Ana sayfa panelleri — Yönetim',
      },
      {
        path: 'mesajlar',
        loadComponent: () => import('./messages.page').then((m) => m.AdminMessages),
        title: 'Mesajlar — Yönetim',
      },
      {
        path: 'mesaj-konulari',
        loadComponent: () => import('./message-topics.page').then((m) => m.AdminMessageTopics),
        title: 'Mesaj konuları — Yönetim',
      },
      {
        path: 'gorseller',
        loadComponent: () => import('./media.page').then((m) => m.AdminMedia),
        title: 'Görseller — Yönetim',
      },
    ],
  },
];
