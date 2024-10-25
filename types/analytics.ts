export interface AnalyticsItem {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

export interface AnalyticsAdminDashboard {
  name: string;
  totalTransactions: number;
  totalTransactionsAmount: number;
  etagCount: number;
  orderCount: number;
  packageCount: number;
}

export interface AnalyticsPostProps {
  startDate: string;
  days: number;
}
