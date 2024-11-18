import { API } from "@/components/services/api";
import { AnalyticsAdminDashboard, AnalyticsPostProps } from "@/types/analytics";

const dataExample: AnalyticsPostProps = {
  startDate: "2024-07-01",
  days: 365,
};

export const AnalyticsServices = {
  getDashboardAnalytics() {
    return API.post("/transaction/dashboard", dataExample);
  },
};
