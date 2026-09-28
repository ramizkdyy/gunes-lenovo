import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthGuard, type AuthedRequest } from './auth.guard';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalı' })
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.userId);
  }
}
