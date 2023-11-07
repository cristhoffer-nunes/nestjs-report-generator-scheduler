/* eslint-disable prefer-const */
import { Controller, Get, Logger, UseFilters } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IReportDTO } from 'src/interfaces/report-dto.interface';
import { OracleService } from 'src/services/oracle.service';
import { OrdersService } from 'src/services/orders.service';
import { TasksService } from 'src/services/tasks.service';
import { TasksExceptionFilter } from 'src/utils/task-expection-filter.utils';

@Controller('tasks')
@UseFilters(TasksExceptionFilter)
export class TaskController {
  private logger: Logger;

  constructor(
    private readonly oracleService: OracleService,
    private readonly ordersService: OrdersService,
    private readonly tasksService: TasksService,
  ) {
    this.logger = new Logger(TaskController.name);
  }

  @Get('scheduleReport')
  @Cron('0 6 * * *')
  async schedulerReport() {
    this.logger.log('TASK [SCHEDULER REPORT] - STARTING...');
    const orders = await this.ordersService.findAll();
    const report: Array<IReportDTO> = [];

    for (let i = 0; i < orders.length; i++) {
      orders[i].commerceItems.forEach((product) => {
        product.priceInfo.orderDiscountInfos.forEach((item) => {
          if (item.couponCodes.length > 0) {
            const filtro = report.filter(
              (reportObject) => reportObject.Pedido_OCC === orders[i].id,
            );

            if (filtro.length == 0) {
              let payload: IReportDTO = {
                Data_Pedido: orders[i].submittedDate,
                Pedido_OCC: orders[i].id,
                Pedido_SAP: orders[i].Pedido_SAP,
                Cupom: item.couponCodes[0],
                CPF_CNPJ: orders[i].client_document,
                Valor_descontado: orders[i].priceInfo.discountAmount,
                Valor_frete: orders[i].priceInfo.shipping,
                Subtotal_bruto: orders[i].priceInfo.rawSubtotal,
                Subtotal_com_frete:
                  orders[i].priceInfo.rawSubtotal +
                  orders[i].priceInfo.shipping,
                Valor_Bruto: orders[i].priceInfo.amount,
                Valor_com_frete: orders[i].priceInfo.total,
              };

              report.push(payload);
            }
          }
        });
      });
    }

    this.logger.log(
      `TASK [SCHEDULER REPORT] - ORDERS LENGTH: ${orders.length} - REPORT LENGTH: ${report.length}`,
    );

    await this.tasksService.JsonToXlsx(report);
    await this.tasksService.sendEmail();
    this.tasksService.deleteFiles();
    this.logger.log(`TASK [SCHEDULER REPORT] - COMPLETED`);
  }

  async insertOrders() {
    this.logger.log('TASK [INSERT ORDERS] - STARTING...');
    let offset: number = 0;
    let executions: number = 0;

    const { totalResults, limit } = await this.oracleService.getOrders(offset);

    if (totalResults <= 250) {
      executions = 1;
    } else {
      executions = Math.ceil(totalResults / limit);
    }

    this.logger.log(
      `TASK [INSERT ORDERS] - EXECUTIONS: ${executions - 1} - OFFSETS: ${
        (executions - 1) * 250
      } `,
    );

    for (let i = 0; i < executions; i++) {
      try {
        this.logger.log(
          `TASK [INSERT ORDERS] - EXECUTIONS: ${
            executions - 1
          } - OFFSET: ${offset}`,
        );
        const { items } = await this.oracleService.getOrders(offset);
        await this.ordersService.createMany(items);
        offset = offset + 250;
      } catch (error) {
        this.logger.error(`TASK [INSERT ORDERS] - ERROR MESSAGE: ${error}`);
      }
    }

    this.logger.log('TASK [INSERT ORDERS] - COMPLETED');
  }

  @Get('insertCurrentOrders')
  @Cron('0 4 * * *')
  async insertCurrentOrders() {
    this.logger.log('TASK [INSERT CURRENT ORDERS] - STARTING...');
    let offset: number = 0;
    let executions: number = 0;

    const { totalResults, limit, items } =
      await this.oracleService.getCurrentOrders(offset);

    if (items.length === 0) {
      this.logger.log('TASK [INSERT CURRENT ORDERS] - NO ORDERS TO INSERT...');
    } else {
      if (totalResults <= 250) {
        executions = 1;
      } else {
        executions = Math.ceil(totalResults / limit);
      }
      this.logger.log(
        `TASK [INSERT CURRENT ORDERS] - EXECUTIONS: ${
          executions - 1
        } - TOTAL RESULTS: ${totalResults}`,
      );

      for (let i = 0; i < executions; i++) {
        try {
          this.logger.log(
            `TASK [INSERT CURRENT ORDERS] - EXECUTION: ${i} - GET ORDERS...`,
          );
          const { items } = await this.oracleService.getCurrentOrders(offset);
          items.forEach(async (order) => {
            try {
              this.logger.log('TASK [INSERT CURRENT ORDERS] - INSERT ORDER...');
              await this.ordersService.create(order);
              this.logger.log(
                `TASK [INSERT CURRENT ORDERS] - ORDER INSERTED...`,
              );
              offset = offset + 250;
            } catch (error) {
              this.logger.error(
                `TASK [INSERT CURRENT ORDERS] - INSERT ORDER ERROR: ${error}`,
              );
            }
          });
        } catch (error) {
          this.logger.error(
            `TASK [INSERT CURRENT ORDERS] - GET ORDERS ERROR MESSAGE: ${error}`,
          );
        }
      }

      this.logger.log('TASK [INSERT CURRENT ORDERS] - COMPLETED...');
    }
  }
}
