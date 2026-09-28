import { Module } from '@nestjs/common';
import { MessagesAdminController, MessagesPublicController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  controllers: [MessagesPublicController, MessagesAdminController],
  providers: [MessagesService],
})
export class MessagesModule {}
