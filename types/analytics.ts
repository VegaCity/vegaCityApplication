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
  name: string;
  formattedDate: string;
  endDayCheckWalletCashierBalance: number;
  endDayCheckWalletCashierBalanceHistory: number;
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
  totalWithdrawRequest: number;
  totalAmountWithdrawFromVega: number;
}

export interface AdminAnalyticsByMonth {
  adminBalance: number;
  adminBalanceHistory: number;
  vcardsCurrentActive: number;
  usersCurrentActive: number;
  groupedStaticsAdmin: GroupedStaticsAdminByMonth[];
}

export interface CashierAnalyticsByMonth {
  cashierWebBalance: number;
  cashierWebBalanceHistory: number;
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
  totalAmountOrderFeeChargeCash: number;
  totalAmountOrderFeeChargeVirtualMoney: number;
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
  usersCurrentActive: number;
  groupedStaticsAdmin: GroupedStaticsAdminByDate[];
}

export interface CashierAnalyticsByDate {
  cashierWebBalance: number;
  cashierWebBalanceHistory: number;
  groupedStaticsAdmin: GroupedStaticsAdminByDate[];
}

export interface GroupedStaticsStoreByDate {
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
  totalOrderVcard: number;
  totalAmountOrderVcard: number;
  storeDepositsFromVcardPayment: number;
  vegaDepositsAmountFromStore: number;
}

export interface StoreAnalyticsByDate {
  storeBalance: number;
  storeBalanceHistory: number;
  totalVcards: number;
  groupedStaticsAdmin: GroupedStaticsStoreByDate[];
}

export interface GroupedStaticsStoreByMonth {
  name: string;
  storeDepositsFromVcardPayment: number;
  totalAmountCashOrder: number;
  totalAmountOrder: number;
  totalAmountOrderOnlineMethod: number;
  totalAmountOrderVcard: number;
  totalOrder: number;
  totalOrderCash: number;
  totalOrderOnlineMethods: number;
  totalOrderVcard: number;
  vegaDepositsAmountFromStore: number;
}

export interface StoreAnalyticsByMonth {
  storeBalance: number;
  storeBalanceHistory: number;
  totalVcards: number;
  groupedStaticsAdmin: GroupedStaticsStoreByMonth[];
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
