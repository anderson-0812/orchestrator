import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { LengthDb } from 'libs/common/globs/generals/length.db';

export class CreateProductDto {

  // codIGO DE PRODUCTO 
  @IsString()
  @MaxLength(LengthDb.code)
  sku: string;

  @IsString()
  @MaxLength(LengthDb.name)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(LengthDb.description)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  // Precio en centavos ( 1299 CTVS => $12.99)
  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountCents?: number;
}
