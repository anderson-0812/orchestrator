import { LengthDb } from 'libs/common/globs/generals/length.db';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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

}
