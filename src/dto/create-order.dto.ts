export class CreateOrderDto {
  submittedDate: string;
  id: string;
  commerceItems: Array<CommerceItems>;
  Pedido_SAP: string;
  client_document: string;
  priceInfo: PriceInfo;
}

interface CommerceItems {
  priceInfo: {
    orderDiscountInfos: [
      {
        couponCodes: [string];
        amount: number;
        promotionId: string;
      },
    ];
  };
}

interface PriceInfo {
  secondaryCurrencyTaxAmount: number;
  discounted: boolean;
  secondaryCurrencyShippingAmount: number;
  amount: number;
  secondaryCurrencyTotal: number;
  manualAdjustmentTotal: number;
  discountAmount: number;
  tax: number;
  rawSubtotal: number;
  total: number;
  shipping: number;
  primaryCurrencyTotal: number;
  amountIsFinal: boolean;
  orderTotalBySite: {
    siteUS: number;
  };
  currencyCode: string;
}
