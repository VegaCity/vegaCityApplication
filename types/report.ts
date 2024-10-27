export interface ReportType {
  id: string;
  issueTypeId: string;
  description: string;
  storeId: string;
  status: number;
}

export interface ReportPatchType {
  solution: string;
  status: number;
}
