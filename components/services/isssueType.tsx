import { API } from "@/components/services/api";
import { CreateIssueType } from "@/types/issueType/issueType";
import { ReportPatchType } from "@/types/report/report";

interface IssueTypePageSize {
  page?: number;
  size?: number;
}

export const IssueTypeServices = {
  getIssueTypes({ page, size }: IssueTypePageSize) {
    return API.get("/report/issue-types", {
      params: {
        page,
        size,
      },
    });
  },

  createIssueType(issueTypeData: CreateIssueType) {
    return API.post(`/report/issue-type`, issueTypeData);
  },
  deleteIssueType(id: string) {
    return API.delete(`/report/issue-type/${id}`);
  },
};
