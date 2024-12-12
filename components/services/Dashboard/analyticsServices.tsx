import { API } from "@/components/services/api";
import {
  AdminAnalyticsByMonth,
  StoreAnalytics,
  AnalyticsPostProps,
  TopSaleStoresPost,
} from "@/types/analytics";

export const AnalyticsServices = {
  getUserById(userId: string) {
    return API.get(`/user/${userId}`);
  },
  getDashboardAnalytics(data: AnalyticsPostProps) {
    return API.post("/transaction/dashboard", data);
  },
  getTopSaleStoreInMonth(data: TopSaleStoresPost) {
    return API.post("/top-sale/dashboard", data);
  },
};
