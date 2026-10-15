import { IsString, Matches, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @MaxLength(40, { message: 'Telefon numarası çok uzun' })
  // En az 7 rakam olsun; boşluk, +, parantez ve tire serbest.
  @Matches(/^\+?[\d\s()-]*(\d[\s()-]*){7,}$/, { message: 'Geçerli bir telefon numarası yazın' })
  phone!: string;
}
