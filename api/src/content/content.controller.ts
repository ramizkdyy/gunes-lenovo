import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ContentService } from './content.service';
import { CategoryDto, HeroSlideDto, ProductDto, ReorderDto } from './dto';

/**
 * Sitenin okuduğu uçlar. Oturum istemez, yalnızca yayındaki
 * içeriği döndürür — taslaklar buradan görünmez.
 */
@Controller()
export class PublicController {
  constructor(private readonly content: ContentService) {}

  @Get('categories')
  categories() {
    return this.content.categories();
  }

  @Get('categories/:slug')
  category(@Param('slug') slug: string) {
    return this.content.category(slug);
  }

  @Get('categories/:categorySlug/:slug')
  product(@Param('categorySlug') categorySlug: string, @Param('slug') slug: string) {
    return this.content.product(categorySlug, slug);
  }

  @Get('hero-slides')
  heroSlides() {
    return this.content.heroSlides();
  }
}

/** Panelin kullandığı uçlar. Hepsi oturum ister, taslakları da görür. */
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly content: ContentService) {}

  // Kategoriler
  @Get('categories')
  categories() {
    return this.content.categories(true);
  }

  @Get('categories/:id')
  categoryById(@Param('id', ParseIntPipe) id: number) {
    return this.content.categoryById(id);
  }

  @Post('categories')
  createCategory(@Body() dto: CategoryDto) {
    return this.content.createCategory(dto);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: CategoryDto) {
    return this.content.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.content.deleteCategory(id);
  }

  @Post('categories/reorder')
  reorderCategories(@Body() items: ReorderDto[]) {
    return this.content.reorder('category', items);
  }

  // Ürünler
  @Get('products')
  products() {
    return this.content.products(true);
  }

  @Get('products/:id')
  productById(@Param('id', ParseIntPipe) id: number) {
    return this.content.productById(id);
  }

  @Post('products')
  createProduct(@Body() dto: ProductDto) {
    return this.content.createProduct(dto);
  }

  @Put('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: ProductDto) {
    return this.content.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.content.deleteProduct(id);
  }

  @Post('products/reorder')
  reorderProducts(@Body() items: ReorderDto[]) {
    return this.content.reorder('product', items);
  }

  // Hero panelleri
  @Get('hero-slides')
  heroSlides() {
    return this.content.heroSlides(true);
  }

  @Get('hero-slides/:id')
  heroSlideById(@Param('id', ParseIntPipe) id: number) {
    return this.content.heroSlideById(id);
  }

  @Post('hero-slides')
  createHeroSlide(@Body() dto: HeroSlideDto) {
    return this.content.createHeroSlide(dto);
  }

  @Put('hero-slides/:id')
  updateHeroSlide(@Param('id', ParseIntPipe) id: number, @Body() dto: HeroSlideDto) {
    return this.content.updateHeroSlide(id, dto);
  }

  @Delete('hero-slides/:id')
  deleteHeroSlide(@Param('id', ParseIntPipe) id: number) {
    return this.content.deleteHeroSlide(id);
  }

  @Post('hero-slides/reorder')
  reorderHeroSlides(@Body() items: ReorderDto[]) {
    return this.content.reorder('heroSlide', items);
  }
}
