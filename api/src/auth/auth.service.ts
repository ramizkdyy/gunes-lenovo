import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  /**
   * E-posta ve şifreyi doğrular, oturum jetonu üretir.
   * Kullanıcı yoksa da şifre yanlışsa da aynı hata döner —
   * hangi e-postaların kayıtlı olduğu dışarıdan anlaşılmasın diye.
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw new UnauthorizedException('E-posta veya şifre hatalı');

    return {
      token: await this.jwt.signAsync({ sub: user.id, email: user.email }),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
