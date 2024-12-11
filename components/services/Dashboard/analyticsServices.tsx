import { API } from "@/components/services/api";
import {
  AdminAnalytics,
  StoreAnalytics,
  AnalyticsPostProps,
  TopSaleStoresPost,
} from "@/types/analytics";

const dataExample: AnalyticsPostProps = {
  startDate: "2024-07-01",
  days: 365,
};

// const dataTopSaleExample: TopSaleStoresPost = {
//   startDate: "2024-07-01",
//   endDate: "2025-03-03",
//   storeType: "Product",
//   groupBy: "Month",
// };

export const AnalyticsServices = {
  getUserById(userId: string) {
    return API.get(`/user/${userId}`);
  },
  getDashboardAnalytics() {
    return API.post("/transaction/dashboard", dataExample);
  },
  getTopSaleStoreInMonth(data: TopSaleStoresPost) {
    return API.post("/top-sale/dashboard", data);
  },
};
