import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
export class CommerceItemsPrinceInfo {
  @Prop()
  orderDiscountInfos: Array<OrderDiscountInfos>;
}

@Schema()
export class OrderDiscountInfos {
  @Prop()
  couponCodes: [string];

  @Prop()
  amount: number;

  @Prop()
  promotionId: string;
}

@Schema()
export class CommerceItems {
  @Prop()
  priceInfo: CommerceItemsPrinceInfo;
}

export class OrderTotalBySite {
  siteUS: number;
}

@Schema()
export class PriceInfo {
  @Prop()
  secondaryCurrencyTaxAmount: number;

  @Prop()
  discounted: boolean;

  @Prop()
  secondaryCurrencyShippingAmount: number;

  @Prop()
  amount: number;

  @Prop()
  secondaryCurrencyTotal: number;

  @Prop()
  manualAdjustmentTotal: number;

  @Prop()
  discountAmount: number;

  @Prop()
  tax: number;

  @Prop()
  rawSubtotal: number;

  @Prop()
  total: number;

  @Prop()
  shipping: number;

  @Prop()
  primaryCurrencyTotal: number;

  @Prop()
  amountIsFinal: boolean;

  @Prop()
  orderTotalBySite: OrderTotalBySite;

  @Prop()
  currencyCode: string;
}

@Schema()
export class Order {
  @Prop()
  submittedDate: string;

  @Prop({ unique: true })
  id: string;

  @Prop()
  commerceItems: Array<CommerceItems>;

  @Prop()
  Pedido_SAP: string;

  @Prop()
  client_document: string;

  @Prop()
  priceInfo: PriceInfo;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
