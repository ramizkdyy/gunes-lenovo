import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  ValidateIf,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Siteden gelen form. Doğrulama mesajları ziyaretçiye gösteriliyor. */
export class CreateMessageDto {
  @IsString()
  @MinLength(2, { message: 'Adınızı yazın' })
  @MaxLength(120, { message: 'Ad çok uzun' })
  name!: string;

  @IsOptional() @IsString() @MaxLength(160, { message: 'Firma adı çok uzun' }) company?: string;

  // İkisinden en az biri dolu olmalı; bu kontrol serviste yapılıyor
  // çünkü alan bazlı kuralla yazınca iki alandan da hata mesajı düşüyor.
  @IsOptional()
  @IsString()
  @MaxLength(40, { message: 'Telefon numarası çok uzun' })
  phone?: string;

  // Form boş alanı "" olarak gönderiyor; IsOptional yalnızca null/undefined
  // atlıyor, o yüzden boş dizeyi de elemek gerekiyor.
  @ValidateIf((dto: CreateMessageDto) => !!dto.email?.trim())
  @IsEmail({}, { message: 'Geçerli bir e-posta yazın' })
  @MaxLength(160, { message: 'E-posta çok uzun' })
  email?: string;

  @IsString()
  @MinLength(10, { message: 'Mesajınızı biraz açar mısınız? (en az 10 karakter)' })
  @MaxLength(4000, { message: 'Mesaj çok uzun (en fazla 4000 karakter)' })
  body!: string;

  @IsOptional() @Type(() => Number) @IsInt() topicId?: number;
  @IsOptional() @Type(() => Number) @IsInt() productId?: number;
  @IsOptional() @IsString() @MaxLength(300) sourcePath?: string;
}

export class MessageTopicDto {
  @IsString()
  @MinLength(2, { message: 'Konu adı zorunlu' })
  @MaxLength(120)
  label!: string;

  @IsOptional() @Type(() => Number) @IsInt() sort?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateMessageStatusDto {
  @IsIn(['NEW', 'READ', 'ARCHIVED'], { message: 'Durum geçersiz' })
  status!: 'NEW' | 'READ' | 'ARCHIVED';
}
