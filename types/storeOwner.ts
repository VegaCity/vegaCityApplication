export interface StoreOwner {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  shortName: string;
  email: string;
  description: string;
  storeType: number;
  storeStatus: number;
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
