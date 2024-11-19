export interface ProductData {
  id: string;
  name: string;
  price: number;
  imgUrl: string;
  quantity: number;
}

export interface ProductStoreData {
  id: string;
  name: string;
  price: number;
  imgUrl: string;
  quantity: number;
  productCategory: string | undefined;
}

export interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  // gender: string;
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
  // transactionChargeId: string;
  transactionId: string;
}
export interface ConfirmOrderForChargeVCardData {
  invoiceId: string;
  transactionChargeId: string;
}
export interface ConfirmOrderForGenerateNewCardData {
  invoiceId: string;
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

export interface OrderStoreData {
  saleType: string;
  storeId: string;
  totalAmount: number;
  packageOrderId: string;
  productData: ProductStoreData[];
}

export interface OrderDetailData {
  id: string;
  orderId: string;
  productId: string | null;
  crDate: string;
  upsDate: string;
  storeServiceId: string | null;
  finalAmount: number;
  promotionAmount: number;
  amount: number;
  vatAmount: number;
  quantity: number;
  order: Order | null;
  product: ProductData | null;
}

export interface OrderExistData {
  id: string;
  paymentType: string;
  name: string;
  totalAmount: number;
  crDate: string;
  upsDate: string;
  status: string;
  invoiceId: string;
  storeId: string | null;
  packageItemId: string | null;
  packageId: string;
  userId: string;
  saleType: string;
  package: string | null;
  packageItem: string | null;
  store: string | null;
  user: UserResponse;
  deposits: any[]; // Define structure if known
  orderDetails: OrderDetailData[];
  packageOrder: PackageOrderResponse; // Define structure if known
  promotionOrders: any[]; // Define structure if known
  transactions: any[]; // Define structure if known
  payments: PaymentResponse[]; // Define structure if known
}
export interface PaymentResponse {
  name: string;
}
export interface UserResponse {
  fullName: string;
  email: string;
  cccdPassport: string;
}
export interface PackageOrderResponse {
  id: string;
  cusName: string;
  cusCccdpassport: string;
  phoneNumber: string;
  cusEmail: string;
}

export interface OrderDetailResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    orderExist: OrderExistData;
    productJson: any | null; // Define structure if known
    customer: CustomerInfo | null;
  };
}
