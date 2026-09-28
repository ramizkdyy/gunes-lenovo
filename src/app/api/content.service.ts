import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Category, HeroSlide, Product } from './models';

/**
 * Sitenin okuduğu içerik. Yalnızca yayındaki kayıtlar döner;
 * taslaklar API tarafında süzülüyor.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Kategori listesi birden çok yerde kullanılıyor, bir kez çekilir. */
  private categories$?: Observable<Category[]>;

  categories(): Observable<Category[]> {
    this.categories$ ??= this.http
      .get<Category[]>(`${this.base}/categories`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.categories$;
  }

  /** Kategori ve içindeki yayındaki ürünler, tek istekte. */
  category(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.base}/categories/${slug}`);
  }

  product(categorySlug: string, slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/categories/${categorySlug}/${slug}`);
  }

  heroSlides(): Observable<HeroSlide[]> {
    return this.http.get<HeroSlide[]>(`${this.base}/hero-slides`);
  }
}
