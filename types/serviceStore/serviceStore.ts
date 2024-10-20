export interface GetServicesStore {
  id: string;
  name: string;
  storeId: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
}

export interface PatchServicesStore {
  name: string;
}

export interface PostServicesStore {
  name: string;
  storeId: string;
}
