import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateSettingsDto } from './dto';
import { SettingsService } from './settings.service';

/** Sitenin okuduğu ayarlar. Oturum istemez. */
@Controller()
export class SettingsPublicController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  get() {
    return this.settings.publicSettings();
  }
}

/** Panelin ayar ekranı. */
@Controller('admin')
@UseGuards(AuthGuard)
export class SettingsAdminController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  get() {
    return this.settings.adminSettings();
  }

  @Put('settings')
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}
