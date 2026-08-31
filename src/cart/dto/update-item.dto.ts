import { IsNumber, Min } from 'class-validator';

export class UpdateItemDto {
  @IsNumber()
  @Min(1)
  quantity!: number;
}
