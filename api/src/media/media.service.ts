import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';

/** Yeniden boyutlandırma isteğinin sınırları. */
export interface TransformOptions {
  width?: number;
  height?: number;
  fit: 'cover' | 'contain' | 'inside';
  format: 'webp' | 'jpeg' | 'png' | 'original';
}

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const CACHE_DIR = join(UPLOAD_DIR, 'cache');
const MAX_DIMENSION = 3000;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

/**
 * Görsel deposu. Orijinal dosya `uploads/` içinde durur; istenen boyut
 * ilk seferde üretilip `uploads/cache/` altına yazılır, sonraki
 * isteklerde diskten okunur.
 */
@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async save(file: Express.Multer.File, alt = '') {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Yalnızca JPG, PNG, WebP, AVIF ve SVG yüklenebilir');
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    // SVG'de sharp metadata güvenilir değil; vektör olduğu için boyut da gereksiz.
    const isSvg = file.mimetype === 'image/svg+xml';
    const meta = isSvg ? { width: 0, height: 0 } : await sharp(file.buffer).metadata();

    const media = await this.prisma.media.create({
      data: {
        filename: '',
        mimeType: file.mimetype,
        size: file.size,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        alt,
      },
    });

    const extension = this.extensionFor(file.mimetype);
    const filename = `${media.id}.${extension}`;
    await writeFile(join(UPLOAD_DIR, filename), file.buffer);

    return this.prisma.media.update({ where: { id: media.id }, data: { filename } });
  }

  list() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateAlt(id: string, alt: string) {
    await this.get(id);
    return this.prisma.media.update({ where: { id }, data: { alt } });
  }

  /**
   * Kaydı ve diskteki dosyayı siler. Görseli kullanan kayıtlarda
   * `imageId` boşalır (şemada onDelete: SetNull), site yer tutucuya düşer.
   */
  async remove(id: string) {
    const media = await this.get(id);
    await this.prisma.media.delete({ where: { id } });
    await unlink(join(UPLOAD_DIR, media.filename)).catch(() => undefined);
    return { ok: true };
  }

  async get(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Görsel bulunamadı');
    return media;
  }

  /** İstenen boyuttaki dosyayı döndürür; yoksa üretip cache'ler. */
  async render(id: string, options: TransformOptions) {
    const media = await this.get(id);
    const originalPath = join(UPLOAD_DIR, media.filename);
    if (!existsSync(originalPath)) throw new NotFoundException('Dosya diskte yok');

    // Vektörde ve dönüşüm istenmediğinde orijinali olduğu gibi ver.
    const untouched = !options.width && !options.height && options.format === 'original';
    if (media.mimeType === 'image/svg+xml' || untouched) {
      return { body: await readFile(originalPath), mimeType: media.mimeType };
    }

    const cacheKey = createHash('sha1')
      .update(`${id}|${options.width ?? ''}|${options.height ?? ''}|${options.fit}|${options.format}`)
      .digest('hex');
    const format = options.format === 'original' ? this.extensionFor(media.mimeType) : options.format;
    const cachePath = join(CACHE_DIR, `${cacheKey}.${format}`);

    if (existsSync(cachePath)) {
      return { body: await readFile(cachePath), mimeType: `image/${format}` };
    }

    let pipeline = sharp(await readFile(originalPath));
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width ? Math.min(options.width, MAX_DIMENSION) : undefined,
        height: options.height ? Math.min(options.height, MAX_DIMENSION) : undefined,
        fit: options.fit,
        // `contain` büyütmesin; küçük yüklenen görsel bulanıklaşmasın.
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      });
    }

    if (format === 'webp') pipeline = pipeline.webp({ quality: 82 });
    else if (format === 'jpeg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
    else if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9 });

    const body = await pipeline.toBuffer();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath, body);

    return { body, mimeType: `image/${format}` };
  }

  private extensionFor(mimeType: string): 'jpeg' | 'png' | 'webp' | 'avif' | 'svg' {
    const map: Record<string, 'jpeg' | 'png' | 'webp' | 'avif' | 'svg'> = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/svg+xml': 'svg',
    };
    return map[mimeType] ?? 'jpeg';
  }
}
