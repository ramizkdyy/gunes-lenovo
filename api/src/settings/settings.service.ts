import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateSettingsDto } from './dto';

/** Ayarlar tek satırda durur; ilk okumada şemadaki varsayılanlarla oluşur. */
const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
      select: { phone: true },
    });
  }

  update(dto: UpdateSettingsDto) {
    const phone = dto.phone.trim().replace(/\s+/g, ' ');
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, phone },
      update: { phone },
      select: { phone: true },
    });
  }
}
