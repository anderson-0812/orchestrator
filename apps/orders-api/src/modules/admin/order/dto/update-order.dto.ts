import { IsInt, IsOptional } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends CreateOrderDto {
  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  totalCents?: number;

  @IsOptional()
  @IsInt()
  cantProducts?: number;
}

