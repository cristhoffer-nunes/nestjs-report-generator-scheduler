import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Logger } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  private logger: Logger;

  constructor(private readonly ordersService: OrdersService) {
    this.logger = new Logger(OrdersController.name);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }
  @Post('createMany')
  async createMany(@Body() createOrderDto: Array<CreateOrderDto>) {
    await this.ordersService.createMany(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('/pagination')
  findByPagination(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 250,
  ) {
    return this.ordersService.findByPagination(page, limit);
  }

  @Delete('deleteMany')
  async deleteMany() {
    return await this.ordersService.deleteMany();
  }
}
