export enum StoreTypeEnum {
  Food = 0,
  Clothing = 1,
  Other = 2,
}

export interface StoreOwner {
  id: string;
  houseId: string;
  name: string;
  address: string;
  phoneNumber: string;
  shortName: string;
  email: string;
  description: string;
  storeType: number;
  zoneName: string;
  status: number;
  deflag: boolean;
}

export interface StoreOwnerPatch {
  name: string;
  address: string;
  phoneNumber: string;
  shortName: string;
  email: string;
  description: string;
  storeType: number;
  storeStatus: number;
}

export interface StoreInHouse {
  address: string;
  crDate: string;
  deflag: boolean;
  description: null;
  email: string;
  houseId: string;
  id: string;
  name: string;
  phoneNumber: string;
  shortName: string | null;
  status: number;
  storeType: number | null;
  upsDate: string;
}
