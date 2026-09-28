import { Module } from '@nestjs/common';
import { AdminController, PublicController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  controllers: [PublicController, AdminController],
  providers: [ContentService],
})
export class ContentModule {}
