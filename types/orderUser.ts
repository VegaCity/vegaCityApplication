
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
    cccd: string;
  }
  
  export interface OrderData {
    saleType: string;
    paymentType: string;
    totalAmount: number;
    productData: ProductData[];
    customerInfo: CustomerInfo;
  }
  
  export interface GenerateEtagRequest {
    startDate: Date;
    endDate: Date;
    day: number;
    moneyStart: number;
  }
  
  export interface ConfirmOrderData {
    invoiceId: string;
    generateEtagRequest: GenerateEtagRequest;
  }
  