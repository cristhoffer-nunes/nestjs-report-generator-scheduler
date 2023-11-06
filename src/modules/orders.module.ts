import { Module } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { OrdersController } from '../controllers/orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../entities/order.entity';
import { OracleService } from '../services/oracle.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TaskController } from 'src/controllers/task.controller';
import { TasksService } from 'src/services/tasks.service';
import envVariablesConfig from 'src/config/env-variables.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
        collection: envVariablesConfig.MONGODB_COLLECTION,
      },
    ]),
    ConfigModule.forRoot(),
    HttpModule,
  ],
  controllers: [OrdersController, TaskController],
  providers: [OrdersService, OracleService, TasksService],
})
export class OrdersModule {}
