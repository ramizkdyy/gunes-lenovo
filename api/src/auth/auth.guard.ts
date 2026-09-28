import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

/** Oturumu doğrulanmış kullanıcının kimliği isteğe iliştirilir. */
export interface AuthedRequest extends Request {
  userId: string;
}

/** `Authorization: Bearer <jeton>` başlığını doğrular. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Oturum açmanız gerekiyor');
    }

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Oturumunuz sona ermiş, tekrar giriş yapın');
    }
  }
}
