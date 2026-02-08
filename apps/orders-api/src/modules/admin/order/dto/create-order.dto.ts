import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';

class OrderItemDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsInt()
  @IsPositive()
  qty: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  customer_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
