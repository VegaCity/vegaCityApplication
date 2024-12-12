import { API } from "@/components/services/api";
import {
  ReportPatchType,
  ReportPostStore,
  ReportPostUser,
} from "@/types/report/report";

interface ReportPageSize {
  page?: number;
  size?: number;
}

export const ReportServices = {
  getReports({ page, size }: ReportPageSize) {
    return API.get("/reports", {
      params: {
        page,
        size,
      },
    });
  },
  getReportById(id: string) {
    return API.get(`/report/${id}`);
  },
  editReport(reportId: string, reportData: ReportPatchType) {
    return API.patch(`/report/${reportId}`, reportData);
  },
  createReportByStore(reportData: ReportPostStore) {
    return API.post(`/report`, reportData);
  },
  createReportByUser(reportData: ReportPostUser) {
    return API.post(`/report`, reportData);
  },
};
