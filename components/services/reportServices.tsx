import { API } from "@/components/services/api";
import { ReportPatchType, ReportPost } from "@/types/report/report";

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
  createReport(reportData: ReportPost, phoneNumber: string) {
    return API.post(`/report?phoneNumber=${phoneNumber}`, reportData);
  },
};
