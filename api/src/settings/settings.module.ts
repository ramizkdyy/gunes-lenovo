import { Module } from '@nestjs/common';
import { SettingsAdminController, SettingsPublicController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsPublicController, SettingsAdminController],
  providers: [SettingsService],
})
export class SettingsModule {}
