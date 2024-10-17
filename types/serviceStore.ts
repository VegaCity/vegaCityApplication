export interface StoreService {
  id: string;
  name: string;
  storeId: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
}
export interface CreateStoreServiceRequest {
  name: string;
  storeId: string;
}

export interface UpdateStoreServiceRequest {
  name: string;
}
export interface MetaData {
  size: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface ServiceResponse {
  statusCode: number;
  messageResponse: string;
  data: StoreService[];
  metaData: MetaData;
}
