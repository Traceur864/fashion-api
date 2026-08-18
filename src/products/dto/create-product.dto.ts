import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @IsString()
  size!: string;

  @IsString()
  color!: string;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsString()
  sku!: string;
}

export class CreateProductDto {
  @IsString()
  categoryId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];
}
