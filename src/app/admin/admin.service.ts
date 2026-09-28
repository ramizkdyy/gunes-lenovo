import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Category, HeroSlide, Media, Message, MessageStatus, MessageTopicAdmin, Product } from '../api/models';

/** Sıralama kaydederken gönderilen liste. */
export interface SortItem {
  id: number;
  sort: number;
}

/**
 * Panelin API'si. Taslaklar dahil her şeyi görür, yazma işlemlerini
 * yapar. İstekleri interceptor jetonla imzalar.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  // ─── Kategoriler ──────────────────────────────────────────────
  categories = () => firstValueFrom(this.http.get<Category[]>(`${this.base}/categories`));
  category = (id: number) => firstValueFrom(this.http.get<Category>(`${this.base}/categories/${id}`));
  createCategory = (body: Partial<Category>) =>
    firstValueFrom(this.http.post<Category>(`${this.base}/categories`, body));
  updateCategory = (id: number, body: Partial<Category>) =>
    firstValueFrom(this.http.put<Category>(`${this.base}/categories/${id}`, body));
  deleteCategory = (id: number) =>
    firstValueFrom(this.http.delete(`${this.base}/categories/${id}`));
  reorderCategories = (items: SortItem[]) =>
    firstValueFrom(this.http.post(`${this.base}/categories/reorder`, items));

  // ─── Ürünler ──────────────────────────────────────────────────
  products = () => firstValueFrom(this.http.get<Product[]>(`${this.base}/products`));
  product = (id: number) => firstValueFrom(this.http.get<Product>(`${this.base}/products/${id}`));
  createProduct = (body: Partial<Product>) =>
    firstValueFrom(this.http.post<Product>(`${this.base}/products`, body));
  updateProduct = (id: number, body: Partial<Product>) =>
    firstValueFrom(this.http.put<Product>(`${this.base}/products/${id}`, body));
  deleteProduct = (id: number) => firstValueFrom(this.http.delete(`${this.base}/products/${id}`));
  reorderProducts = (items: SortItem[]) =>
    firstValueFrom(this.http.post(`${this.base}/products/reorder`, items));

  // ─── Hero panelleri ───────────────────────────────────────────
  heroSlides = () => firstValueFrom(this.http.get<HeroSlide[]>(`${this.base}/hero-slides`));
  heroSlide = (id: number) => firstValueFrom(this.http.get<HeroSlide>(`${this.base}/hero-slides/${id}`));
  createHeroSlide = (body: Partial<HeroSlide>) =>
    firstValueFrom(this.http.post<HeroSlide>(`${this.base}/hero-slides`, body));
  updateHeroSlide = (id: number, body: Partial<HeroSlide>) =>
    firstValueFrom(this.http.put<HeroSlide>(`${this.base}/hero-slides/${id}`, body));
  deleteHeroSlide = (id: number) =>
    firstValueFrom(this.http.delete(`${this.base}/hero-slides/${id}`));
  reorderHeroSlides = (items: SortItem[]) =>
    firstValueFrom(this.http.post(`${this.base}/hero-slides/reorder`, items));

  // ─── Mesajlar ─────────────────────────────────────────────────
  /** status verilmezse arşivlenenler hariç hepsi gelir. */
  messages = (status?: MessageStatus) =>
    firstValueFrom(
      this.http.get<Message[]>(`${this.base}/messages`, { params: status ? { status } : {} })
    );
  unreadCount = () =>
    firstValueFrom(this.http.get<{ count: number }>(`${this.base}/messages/unread-count`));
  setMessageStatus = (id: number, status: MessageStatus) =>
    firstValueFrom(this.http.patch<Message>(`${this.base}/messages/${id}`, { status }));
  deleteMessage = (id: number) => firstValueFrom(this.http.delete(`${this.base}/messages/${id}`));

  // ─── Mesaj konuları ───────────────────────────────────────────
  messageTopics = () =>
    firstValueFrom(this.http.get<MessageTopicAdmin[]>(`${this.base}/message-topics`));
  createMessageTopic = (body: Partial<MessageTopicAdmin>) =>
    firstValueFrom(this.http.post<MessageTopicAdmin>(`${this.base}/message-topics`, body));
  updateMessageTopic = (id: number, body: Partial<MessageTopicAdmin>) =>
    firstValueFrom(this.http.put<MessageTopicAdmin>(`${this.base}/message-topics/${id}`, body));
  deleteMessageTopic = (id: number) =>
    firstValueFrom(this.http.delete(`${this.base}/message-topics/${id}`));
  reorderMessageTopics = (items: SortItem[]) =>
    firstValueFrom(this.http.post(`${this.base}/message-topics/reorder`, items));

  // ─── Görseller ────────────────────────────────────────────────
  media = () => firstValueFrom(this.http.get<Media[]>(`${this.base}/media`));

  uploadMedia(file: File, alt = ''): Promise<Media> {
    const form = new FormData();
    form.append('file', file);
    form.append('alt', alt);
    return firstValueFrom(this.http.post<Media>(`${this.base}/media`, form));
  }

  updateMediaAlt = (id: string, alt: string) =>
    firstValueFrom(this.http.patch<Media>(`${this.base}/media/${id}`, { alt }));
  deleteMedia = (id: string) => firstValueFrom(this.http.delete(`${this.base}/media/${id}`));
}
