import { GetServicesStore } from "@/types/store/serviceStore";

// Interface definitions for Store and related entities
export interface Store {
  id: string;
  storeType: number; // changed to number based on response
  name: string;
  address: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  phoneNumber: string;
  shortName: string;
  email: string;
  zoneId: string;
  marketZoneId: string;
  description: string;
  status: number;
  zone: any | null;
  menus: Menu[];
  disputeReports?: any[];
  orders: any[];
  storeMoneyTransfers: any[];
  storeServices: GetServicesStore[];
  transactions: any[];
  userStoreMappings: any[];
  wallets: any[];
}

export interface Menu {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  storeId: string;
  imageUrl: string;
  address: string;
  phoneNumber: string;
  menuJson: string;
  store: Store | null;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  productCategoryId: string;
  menuId: string;
  price: number;
  crDate: string;
  upsDate: string;
  status: string;
  imageUrl: string;
  menu: Menu | null;
  productCategory: ProductCategory | null;
  orderDetails: any[];
}
export interface ProductCategory {
  id: string;
  name: string;
  crDate: string;
  deflag: boolean;
  description: string;
  products: Product[] | null;
  upsDate: string;
  walletTypeMappings: any[];
}
export interface StoreResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    store: Store;
  };
}
