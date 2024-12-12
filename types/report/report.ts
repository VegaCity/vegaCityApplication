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

export interface ReportPostStore {
  creatorStoreId: string;
  issueTypeId: string;
  description: string;
}
export interface ReportPostUser {
  creatorPackageOrderId: string;
  issueTypeId: string;
  description: string;
}

export interface ReportPatchType {
  solution: string;
  status: number;
  solveBy: string;
}
