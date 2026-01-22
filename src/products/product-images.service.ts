import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

type ImageType =
  | 'original'
  | 'cart_default'
  | 'small_default'
  | 'medium_default'
  | 'home_default'
  | 'large_default';

const IMAGE_SIZES: Array<{ type: Exclude<ImageType, 'original'>; w: number; h: number }> =
  [
    { type: 'cart_default', w: 125, h: 125 },
    { type: 'small_default', w: 98, h: 98 },
    { type: 'medium_default', w: 452, h: 452 },
    { type: 'home_default', w: 250, h: 250 },
    { type: 'large_default', w: 800, h: 800 },
  ];

@Injectable()
export class ProductImagesService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
  ) {}

  // storage/img/p/{1}/{6}/{4}
  private getDiskDirForImage(imageId: number): string {
    const digits = String(imageId).split('');
    return join(process.cwd(), 'storage', 'img', 'p', ...digits);
  }

  // /media/img/p/1/6/4
  private getPublicDirForImage(imageId: number): string {
    const digits = String(imageId).split('');
    return `/media/img/p/${digits.join('/')}`;
  }

  private ensureImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');

    const ok = /^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype);
    if (!ok) throw new BadRequestException('Only JPG/PNG/WEBP files are allowed');
  }

  async uploadImage(productId: number, file: Express.Multer.File) {
    this.ensureImage(file);

    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.dataSource.transaction(async (manager) => {
      const imgRepo = manager.getRepository(ProductImage);

      // position = MAX + 1
      const raw = await imgRepo
        .createQueryBuilder('i')
        .select('COALESCE(MAX(i.position), -1)', 'max')
        .where('i.productId = :productId', { productId })
        .getRawOne<{ max: string }>();

      const position = Number(raw?.max ?? -1) + 1;

      // cover: jeśli to pierwsze zdjęcie
      const image = imgRepo.create({
        productId,
        position,
        cover: position === 0,
      });

      const saved = await imgRepo.save(image);

      // ścieżki
      const diskDir = this.getDiskDirForImage(saved.id);
      const publicDir = this.getPublicDirForImage(saved.id);

      await mkdir(diskDir, { recursive: true });

      // zapis original
      const input = file.buffer;

      const originalPath = join(diskDir, 'original.jpg');

      await sharp(input)
        .rotate() // EXIF auto-rotate
        .jpeg({ quality: 88 })
        .toFile(originalPath);

      // generuj resized
      for (const s of IMAGE_SIZES) {
        const outPath = join(diskDir, `${s.type}.jpg`);

        await sharp(input)
          .rotate()
          .resize(s.w, s.h, {
            fit: 'cover', // jak w Presta (kwadrat / przycięcie)
            position: 'centre',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toFile(outPath);
      }

      return {
        id: saved.id,
        productId: saved.productId,
        position: saved.position,
        cover: saved.cover,
        urls: {
          original: `${publicDir}/original.jpg`,
          cart_default: `${publicDir}/cart_default.jpg`,
          small_default: `${publicDir}/small_default.jpg`,
          medium_default: `${publicDir}/medium_default.jpg`,
          home_default: `${publicDir}/home_default.jpg`,
          large_default: `${publicDir}/large_default.jpg`,
        } satisfies Record<ImageType, string>,
      };
    });
  }

  // opcjonalnie na MVP, ale bardzo przydatne:
  async setCover(productId: number, imageId: number) {
    const img = await this.imagesRepo.findOne({ where: { id: imageId, productId } });
    if (!img) throw new NotFoundException('Image not found');

    await this.dataSource.transaction(async (manager) => {
      // reset cover
      await manager.getRepository(ProductImage).update({ productId }, { cover: false });
      // set cover
      await manager.getRepository(ProductImage).update({ id: imageId }, { cover: true });
    });

    return { ok: true };
  }
}