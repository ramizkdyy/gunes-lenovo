import { IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateSettingsDto {
  // Boş bırakılabilir; boşsa sitede numara gösterilmez.
  @IsOptional()
  @IsString()
  @MaxLength(40, { message: 'Telefon numarası çok uzun' })
  // En az 7 rakam olsun; boşluk, +, parantez ve tire serbest.
  @ValidateIf((dto: UpdateSettingsDto) => !!dto.phone?.trim())
  @Matches(/^\+?[\d\s()-]*(\d[\s()-]*){7,}$/, { message: 'Geçerli bir telefon numarası yazın' })
  phone?: string;

  // Virgülle ayrılmış e-posta listesi; boşsa e-posta gönderilmez.
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'E-posta listesi çok uzun' })
  @ValidateIf((dto: UpdateSettingsDto) => !!dto.notifyEmail?.trim())
  @Matches(/^\s*[^\s@,]+@[^\s@,]+\.[^\s@,]+\s*(,\s*[^\s@,]+@[^\s@,]+\.[^\s@,]+\s*)*$/, {
    message: 'E-posta adreslerini kontrol edin (birden fazlaysa virgülle ayırın)',
  })
  notifyEmail?: string;
}
