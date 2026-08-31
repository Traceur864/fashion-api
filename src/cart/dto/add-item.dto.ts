import { IsString, IsNumber, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  variantId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
