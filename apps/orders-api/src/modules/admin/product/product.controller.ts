import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Controller('admin/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create-product')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get('find-all')
  findAll(@Query() filterProductDto: FilterProductDto) {
    return this.productService.findAll(filterProductDto);
  }

  @Get('find-all-total')
  findAllTotal(@Query() filterProductDto: FilterProductDto) {
    return this.productService.findAllTotal(filterProductDto);
  }

  @Patch('find-product-by-parameters')
  findProductByParameters(@Body() filterProductDto: FilterProductDto) {
    return this.productService.findProductByParameters(filterProductDto);
  }

  @Get('find-one/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Patch('logic-delete/:id')
  logicDelete(@Param('id') id: string) {
    return this.productService.logicDelete(+id);
  }
}
