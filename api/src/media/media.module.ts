import { Module } from '@nestjs/common';
import { MediaAdminController, MediaPublicController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaPublicController, MediaAdminController],
  providers: [MediaService],
})
export class MediaModule {}
