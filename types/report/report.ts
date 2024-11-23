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
  packageItemId?: string;
  userId: string;
  issueTypeId: string;
  description: string;
  solution?: string;
  solveBy?: string;
  crDate?: string;
  upsDate?: string;
  status: number;
}

export interface ReportPatchType {
  solution: string;
  status: number;
}
