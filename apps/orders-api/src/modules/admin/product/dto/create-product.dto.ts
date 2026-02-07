import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import { LengthDb } from 'libs/common/globs/generals/length.db';

export class CreateProductDto {
  @IsString()
  @MaxLength(LengthDb.name)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(LengthDb.description)
  description?: string;

  @IsString()
  @MaxLength(LengthDb.code)
  code: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;
}
