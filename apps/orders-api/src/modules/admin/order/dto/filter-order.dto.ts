import { FilterDto } from 'libs/common/globs/generals/filters.dto';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterOrderDto extends FilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsString()
  from?: string; // fecha inicio YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string; // fecha fin YYYY-MM-DD
}
