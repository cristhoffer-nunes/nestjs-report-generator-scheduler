import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../entities/order.entity';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const orderExists = await this.orderModel.findOne({
      id: createOrderDto.id,
    });
    if (orderExists) {
      throw new BadRequestException(
        `ORDER "${createOrderDto.id}" ALREADY EXIST IN THE DATABASE.`,
      );
    }
    const order = new this.orderModel(createOrderDto);
    return order.save();
  }

  async createMany(createOrderDto: Array<CreateOrderDto>) {
    return await this.orderModel.insertMany(createOrderDto);
  }

  findAll() {
    return this.orderModel.find();
  }

  async deleteMany() {
    return await this.orderModel.deleteMany({});
  }
}
