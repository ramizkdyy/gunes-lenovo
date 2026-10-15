import { Injectable, Logger } from '@nestjs/common';

export interface OutgoingMail {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/**
 * Resend üzerinden e-posta gönderir. RESEND_API_KEY ya da MAIL_FROM
 * tanımlı değilse gönderim atlanır; çağıran taraf hiçbir zaman hata almaz.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async send(mail: OutgoingMail): Promise<boolean> {
    const apiKey = process.env['RESEND_API_KEY'];
    const from = process.env['MAIL_FROM'];
    if (!apiKey || !from) {
      this.logger.warn('RESEND_API_KEY / MAIL_FROM tanımlı değil, e-posta gönderilmedi');
      return false;
    }
    if (!mail.to.length) return false;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: mail.to,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        this.logger.error(`E-posta gönderilemedi: ${res.status} ${await res.text()}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`E-posta gönderilemedi: ${(err as Error).message}`);
      return false;
    }
  }
}
