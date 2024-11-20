import { API } from "@/components/services/api";
import {
  AdminAnalytics,
  StoreAnalytics,
  AnalyticsPostProps,
} from "@/types/analytics";

const dataExample: AnalyticsPostProps = {
  startDate: "2024-07-01",
  days: 365,
};

export const AnalyticsServices = {
  getUserById(userId: string) {
    return API.get(`/user/${userId}`);
  },
  getDashboardAnalytics() {
    return API.post("/transaction/dashboard", dataExample);
  },
};
