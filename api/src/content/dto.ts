import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

/** URL'de görünen ad: küçük harf, rakam ve tire. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class BaseDto {
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'], { message: 'Yayın durumu geçersiz' })
  status?: 'DRAFT' | 'PUBLISHED';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsString()
  imageId?: string | null;
}

export class CategoryDto extends BaseDto {
  @IsString()
  @MinLength(2, { message: 'URL adı en az 2 karakter olmalı' })
  @MaxLength(80)
  @Matches(SLUG_PATTERN, { message: 'URL adı yalnızca küçük harf, rakam ve tire içerebilir' })
  slug!: string;

  @IsString()
  @MinLength(2, { message: 'Türkçe ad zorunlu' })
  name!: string;

  @IsOptional() @IsString() desc?: string;
  @IsOptional() @IsString() families?: string;

  /** Yeni ürünlerde gelecek özellik başlıkları. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  specTemplate?: string[];
}

/** Ürünün bir özellik satırı: "İşlemci" → "2x Intel Xeon 6". */
export class SpecDto {
  @IsString() label!: string;
  @IsString() value!: string;
}

export class ProductDto extends BaseDto {
  @IsString()
  @MinLength(2, { message: 'URL adı en az 2 karakter olmalı' })
  @MaxLength(80)
  @Matches(SLUG_PATTERN, { message: 'URL adı yalnızca küçük harf, rakam ve tire içerebilir' })
  slug!: string;

  @Type(() => Number)
  @IsInt({ message: 'Kategori seçilmeli' })
  categoryId!: number;

  @IsString()
  @MinLength(2, { message: 'Model adı zorunlu' })
  model!: string;

  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() desc?: string;
  @IsOptional() @IsString() datasheetUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => SpecDto)
  specs?: SpecDto[];
}

export class HeroSlideDto extends BaseDto {
  @IsString()
  @MinLength(2, { message: 'Türkçe başlık zorunlu' })
  title!: string;

  @IsOptional()
  @IsIn(['dark', 'dark-product', 'light'], { message: 'Geçersiz panel teması' })
  theme?: string;

  @IsOptional() @IsString() eyebrow?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() ctaLabel?: string;
  @IsOptional() @IsString() ctaHref?: string;
}

/** Panelde sürükleyerek sıralama: [{id, sort}, ...] */
export class ReorderDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @Type(() => Number)
  @IsInt()
  sort!: number;
}

export class ListQueryDto {
  /** Panelde taslaklar da görünsün diye. */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDrafts?: boolean;
}
