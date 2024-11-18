export interface GetServicesStore {
  id: string;
  name: string;
  storeId: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  price: number;
  imageUrl?: string | null;
}

export interface PatchServicesStore {
  name: string;
}

export interface PostServicesStore {
  name: string;
  storeId: string;
  imageUrl?: string | null;
  price: number;
}

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
