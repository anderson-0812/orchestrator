import { LengthDb } from 'libs/common/globs/generals/length.db';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(LengthDb.identityCard)
  identityCard?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(LengthDb.firtsName)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(LengthDb.lastName)
  @IsOptional()
  lastName: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(LengthDb.email)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(LengthDb.phone)
  phone?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cursor?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  isActive?: number;

}
