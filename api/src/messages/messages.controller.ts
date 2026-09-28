import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMessageDto, MessageTopicDto, UpdateMessageStatusDto } from './dto';
import { MessagesService } from './messages.service';

/** Sitedeki formun kullandığı uçlar. Oturum istemez. */
@Controller()
export class MessagesPublicController {
  constructor(private readonly messages: MessagesService) {}

  @Get('message-topics')
  topics() {
    return this.messages.activeTopics();
  }

  @Post('messages')
  create(@Body() dto: CreateMessageDto, @Ip() ip: string) {
    return this.messages.create(dto, ip);
  }
}

/** Panelin mesaj ve konu yönetimi. */
@Controller('admin')
@UseGuards(AuthGuard)
export class MessagesAdminController {
  constructor(private readonly messages: MessagesService) {}

  @Get('messages')
  list(@Query('status') status?: 'NEW' | 'READ' | 'ARCHIVED') {
    return this.messages.list(status);
  }

  @Get('messages/unread-count')
  unreadCount() {
    return this.messages.unreadCount();
  }

  @Get('messages/:id')
  byId(@Param('id', ParseIntPipe) id: number) {
    return this.messages.byId(id);
  }

  @Patch('messages/:id')
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageStatusDto) {
    return this.messages.setStatus(id, dto.status);
  }

  @Delete('messages/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.messages.remove(id);
  }

  @Get('message-topics')
  topics() {
    return this.messages.allTopics();
  }

  @Post('message-topics')
  createTopic(@Body() dto: MessageTopicDto) {
    return this.messages.createTopic(dto);
  }

  @Put('message-topics/:id')
  updateTopic(@Param('id', ParseIntPipe) id: number, @Body() dto: MessageTopicDto) {
    return this.messages.updateTopic(id, dto);
  }

  @Delete('message-topics/:id')
  deleteTopic(@Param('id', ParseIntPipe) id: number) {
    return this.messages.deleteTopic(id);
  }

  @Post('message-topics/reorder')
  reorderTopics(@Body() items: { id: number; sort: number }[]) {
    return this.messages.reorderTopics(items);
  }
}
