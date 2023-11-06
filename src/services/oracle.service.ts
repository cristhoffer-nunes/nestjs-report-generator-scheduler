import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { DateInformations } from '../utils/date-informations.utils';
import { IDateInformations } from 'src/interfaces/date-information.interface';

@Injectable()
export class OracleService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.url = this.configService.get('OCC_URL');
    this.appKey = this.configService.get('OCC_APP_KEY');
    this.date = DateInformations();
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
  private date: IDateInformations;

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

  async getOrders(offset: number = 0) {
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.url}/ccadmin/v1/orders?queryFormat=SCIM&fields=submittedDate,id,commerceItems.priceInfo.orderDiscountInfos,Pedido_SAP,client_document,priceInfo&q=submittedDate gt "2023-01-01T03:00:00.000Z" and submittedDate lt "${this.date.currentDay}T03:00:00.000Z"&offset=${offset}`,
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
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.url}/ccadmin/v1/orders?queryFormat=SCIM&fields=submittedDate,id,commerceItems.priceInfo.orderDiscountInfos,Pedido_SAP,client_document,priceInfo&q=submittedDate gt "${this.date.lastDay}T03:00:00.000Z" and submittedDate lt "${this.date.currentDay}T03:00:00.000Z"&offset=${offset}`,
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
