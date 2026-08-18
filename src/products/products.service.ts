import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: string) {
    return this.prisma.product.findMany({
      where: {
        active: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto) {
    const { variants, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants ? { create: variants } : undefined,
      },
      include: {
        variants: true,
        images: true,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        variants: true,
        images: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Producto eliminado' };
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.findOne(productId);

    const exists = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });

    if (exists) throw new ConflictException('El SKU ya está en uso');

    return this.prisma.productVariant.create({
      data: { ...dto, productId },
    });
  }

  async updateVariantStock(variantId: string, stock: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) throw new NotFoundException('Variante no encontrada');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  }
}
