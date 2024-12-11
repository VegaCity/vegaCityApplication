export interface UserRole {
  id: string;
  name: string;
  deflag: boolean;
}

export interface AnalyticsItem {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

export interface User {
  id: string;
  fullName: string;
  role: UserRole;
  storeId?: string;
}

export interface StoreAnalytics {
  name: string;
  orderCount: number;
  orderCashCount: number;
  otherOrderCount: number;
  totalTransaction: number;
  totalAmountFromTransaction: number;
  totalMenu: number;
  totalProduct: number;
}

export interface AdminAnalytics {
  name: string;
  totalTransactions: number;
  totalTransactionsAmount: number;
  etagCount: number;
  orderCount: number;
  packageCount: number;
}
export interface CashierAnalytics {
  name: string;
  totalTransactions: number;
  totalAmountFromTransaction: number;
  etagCount: number;
  orderCount: number;
  orderCash: number;
  otherOrder: number;
}
export interface AnalyticsPostProps {
  startDate: string;
  days: number;
}

export interface TopSaleStores {
  name: "Nov";
  topStores: {
    storeId: string;
    storeName: string;
    storeEmail: string;
    totalTransactions: number;
    totalAmount: number;
  }[];
}

export interface TopSaleStoresPost {
  startDate: string;
  endDate: string;
  storeType: "Product" | "Service" | "All" | string;
  groupBy: "Month" | "Date" | string;
}
