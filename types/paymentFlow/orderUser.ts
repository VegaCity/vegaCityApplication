export interface ProductData {
  id: string;
  name: string;
  price: number;
  imgUrl: string;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  gender: string;
  cccdPassport: string;
  email: string;
}

export interface OrderData {
  saleType: string;
  paymentType: string;
  totalAmount: number;
  productData: ProductData[];
  customerInfo: CustomerInfo;
}

export interface ConfirmOrderData {
  invoiceId: string;
  transactionId: string;
}
export interface ConfirmOrderForChargeData {
  invoiceId: string;
  transactionChargeId: string;
  transactionId: string;
}
export interface Order {
  id: string;
  paymentType: string;
  totalAmount: number;
  saleType: string;
  name: string;
  invoiceId: string;
  status: string;
}
