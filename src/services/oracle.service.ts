import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { IDateInformations } from 'src/interfaces/date-information.interface';

@Injectable()
export class OracleService {
  private readonly logger: Logger = new Logger(OracleService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.url = this.configService.get('OCC_URL');
    this.appKey = this.configService.get('OCC_APP_KEY');
  }

  private occToken = {
    access_token: '',
    expires_in: 0,
    time: {
      getTime: () => 0,
    },
  };

  private url: string;
  private appKey: string;

  async getCurrentToken(): Promise<string> {
    if (
      !this.occToken.access_token ||
      Math.abs(new Date().getTime() - this.occToken.time.getTime()) >
        this.occToken.expires_in * 300
    ) {
      const token = await this.getToken();

      this.occToken.access_token = token.access_token;
      this.occToken.expires_in = token.expires_in;
      this.occToken.time = new Date();
    }

    return this.occToken.access_token;
  }

  async getToken() {
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.url}/ccadmin/v1/login`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${this.appKey}`,
          },
        },
      ),
    );

    if (response.status === 200) {
      return response.data;
    }
  }

  DateInformations(): IDateInformations {
    const currentDay = new Date();
    console.log(currentDay);
    const lastDay = new Date();

    lastDay.setDate(currentDay.getDate() - 1);

    const currentDayFormatted = currentDay.toISOString().slice(0, 10);
    const lastDayFormatted = lastDay.toISOString().slice(0, 10);

    const date: IDateInformations = {
      currentDay: currentDayFormatted,
      lastDay: lastDayFormatted,
    };

    return date;
  }

  async getOrders(offset: number = 0) {
    const date = this.DateInformations();
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.url}/ccadmin/v1/orders?queryFormat=SCIM&fields=submittedDate,id,commerceItems.priceInfo.orderDiscountInfos,Pedido_SAP,client_document,priceInfo&q=submittedDate gt "2023-01-01T03:00:00.000Z" and submittedDate lt "${date.currentDay}T03:00:00.000Z"&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${await this.getCurrentToken()}`,
          },
        },
      ),
    );

    return response.data;
  }

  async getCurrentOrders(offset: number = 0) {
    const date = this.DateInformations();
    this.logger.log(
      `[GET CURRENT ORDERS] - /ccadmin/v1/orders?queryFormat=SCIM&fields=submittedDate,id,commerceItems.priceInfo.orderDiscountInfos,Pedido_SAP,client_document,priceInfo&q=submittedDate gt "${date.lastDay}T03:00:00.000Z" and submittedDate lt "${date.currentDay}T03:00:00.000Z"&offset=${offset}`,
    );
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.url}/ccadmin/v1/orders?queryFormat=SCIM&fields=submittedDate,id,commerceItems.priceInfo.orderDiscountInfos,Pedido_SAP,client_document,priceInfo&q=submittedDate gt "${date.lastDay}T03:00:00.000Z" and submittedDate lt "${date.currentDay}T03:00:00.000Z"&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${await this.getCurrentToken()}`,
          },
        },
      ),
    );

    return response.data;
  }
}
