export interface StoreMenu {
  id: string;
  storeId: string;
  imageUrl: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  dateFilter: number;
}

export interface GetMenuByIdResponse {
  statusCode: number;
  messageResponse: string;
  parentName: null;
  metaData: null;
  data: StoreMenu;
  qrCode: null;
}

export interface StoreMenuPatch {
  imageUrl: string;
  name: string;
  dateFilter: number;
}
export interface StoreMenuPost {
  imageUrl: string;
  name: string;
  dateFilter: string;
}
