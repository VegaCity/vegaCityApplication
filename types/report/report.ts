export interface ReportType {
  id: string;
  issueTypeId: string;
  description: string;
  storeId: string;
  status: number;
}

export interface ReportIssue {
  id: string;
  name: string;
  crDate: string;
}

export interface ReportIssuePost {
  name: string;
}

export interface ReportPost {
  issueTypeId: string;
  description: string;
  storeId: string;
}

export interface ReportPatchType {
  solution: string;
  status: number;
}
