import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { MediaService, type TransformOptions } from './media.service';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Görselin kendisi — herkese açık, siteden `<img src>` ile çağrılır. */
@Controller('media')
export class MediaPublicController {
  constructor(private readonly media: MediaService) {}

  @Get(':id')
  async render(@Param('id') id: string, @Query() query: Record<string, string>, @Res() res: Response) {
    const options: TransformOptions = {
      width: this.toSize(query['w']),
      height: this.toSize(query['h']),
      fit: (['cover', 'contain', 'inside'] as const).find((f) => f === query['fit']) ?? 'contain',
      format: (['webp', 'jpeg', 'png'] as const).find((f) => f === query['format']) ?? 'original',
    };

    const { body, mimeType } = await this.media.render(id, options);

    res.setHeader('Content-Type', mimeType);
    // Dosya adı içeriğe göre sabit (id değişmeden içerik değişmez),
    // bu yüzden uzun süre önbelleğe alınabilir.
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    res.send(body);
  }

  private toSize(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const size = Number.parseInt(value, 10);
    if (!Number.isFinite(size) || size <= 0) return undefined;
    return size;
  }
}

/** Görsel yönetimi — oturum ister. */
@Controller('admin/media')
@UseGuards(AuthGuard)
export class MediaAdminController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list() {
    return this.media.list();
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(@UploadedFile() file: Express.Multer.File, @Body('alt') alt?: string) {
    if (!file) throw new BadRequestException('Dosya seçilmedi');
    return this.media.save(file, alt ?? '');
  }

  @Patch(':id')
  updateAlt(@Param('id') id: string, @Body('alt') alt: string) {
    return this.media.updateAlt(id, alt ?? '');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
