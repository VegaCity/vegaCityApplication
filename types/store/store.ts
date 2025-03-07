import { GetServicesStore } from "@/types/store/serviceStore";
import { StoreTypeEnum, StoreStatusTypeEnum } from "@/types/store/storeOwner";

export interface Store {
  id: string;
  storeType: number;
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
export interface StoreDetail {
  id: string;
  storeType: StoreTypeEnum | number;
  name: string;
  address: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  phoneNumber: string;
  shortName: null;
  email: string;
  zoneId: string;
  marketZoneId: string;
  description: string | null;
  status: StoreStatusTypeEnum | number;
  zone: null;
  wallets: Wallet;
}
export interface Wallet {
  balance: number;
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
  price: number;
  imageUrl: string | null;
  quantity: number;
  duration: number | null;
  unit: string | null;
  menu: any;
  description: string;
  orderDetails: any[];
  productCategoryId: string;
}
export interface ProductCategory {
  id: string;
  name: string;
  crDate: string;
  deflag: boolean;
  description: string;
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
