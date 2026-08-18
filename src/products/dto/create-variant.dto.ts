import { IsString, IsNumber, Min } from 'class-validator';

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
