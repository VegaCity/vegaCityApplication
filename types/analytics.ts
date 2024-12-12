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

export interface GroupedStaticsAdminByMonth {
  endDayCheckWalletCashierBalance: number;
  endDayCheckWalletCashierBalanceHistory: number;
  name: string;
  totalAmountCashOrder: number;
  totalAmountCustomerMoneyTransfer: number;
  totalAmountCustomerMoneyWithdraw: number;
  totalAmountOrder: number;
  totalAmountOrderFeeCharge: number;
  totalAmountOrderOnlineMethod: number;
  totalOrder: number;
  totalOrderCash: number;
  totalOrderFeeCharge: number;
  totalOrderOnlineMethods: number;
  vegaDepositsAmountFromStore: number;
}

export interface AdminAnalyticsByMonth {
  adminBalance: number;
  adminBalanceHistory: number;
  vcardsCurrentActive: number;
  groupedStaticsAdmin: GroupedStaticsAdminByMonth[];
}

export interface GroupedStaticsAdminByDate {
  month: string;
  year: number;
  date: string;
  formattedDate: string;
  totalOrder: number;
  totalAmountOrder: number;
  totalOrderCash: number;
  totalAmountCashOrder: number;
  totalOrderOnlineMethods: number;
  totalAmountOrderOnlineMethod: number;
  totalOrderFeeCharge: number;
  totalAmountOrderFeeCharge: number;
  endDayCheckWalletCashierBalance: number;
  endDayCheckWalletCashierBalanceHistory: number;
  vegaDepositsAmountFromStore: number;
  totalAmountCustomerMoneyWithdraw: number;
  totalAmountCustomerMoneyTransfer: number;
}

export interface AdminAnalyticsByDate {
  adminBalance: number;
  adminBalanceHistory: number;
  vcardsCurrentActive: number;
  groupedStaticsAdmin: GroupedStaticsAdminByDate[];
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
  endDate: string;
  saleType: "All" | "Package" | "PackageItem Charge" | "Product" | string;
  groupBy: "Month" | "Date" | string;
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
