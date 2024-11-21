import { WalletType } from "@/types/walletType/walletType";
import { StoreMenu } from "@/types/store/storeMenu";

export enum StoreTypeEnum {
  Food = 0,
  Clothing = 1,
  Service = 2,
}

export enum StoreStatusTypeEnum {
  Opened = 0,
  Closed = 1,
  InActive = 2,
  Blocked = 3,
}

//Store_StoreStatus Type
interface Store_StoreStatus_Type {
  name: string;
  value: number;
}

export const storeTypes: Store_StoreStatus_Type[] = [
  {
    name: StoreTypeEnum[0],
    value: StoreTypeEnum.Food,
  },
  {
    name: StoreTypeEnum[1],
    value: StoreTypeEnum.Clothing,
  },
  {
    name: StoreTypeEnum[2],
    value: StoreTypeEnum.Service,
  },
];

export const storeStatusTypes: Store_StoreStatus_Type[] = [
  {
    name: StoreStatusTypeEnum[0],
    value: StoreStatusTypeEnum.Opened,
  },
  {
    name: StoreStatusTypeEnum[1],
    value: StoreStatusTypeEnum.Closed,
  },
  {
    name: StoreStatusTypeEnum[2],
    value: StoreStatusTypeEnum.InActive,
  },
  {
    name: StoreStatusTypeEnum[3],
    value: StoreStatusTypeEnum.Blocked,
  },
];

//handle store type from BE (number)
export function handleStoreTypeFromBe(value: number): string {
  switch (value) {
    case 0:
    case 1:
    case 2:
      return StoreTypeEnum[value];
    default:
      throw new Error("Invalid StoreStatus input");
  }
}

//handle store status from BE (number)
export function handleStoreStatusFromBe(value: number): string {
  switch (value) {
    case 0:
    case 1:
    case 2:
    case 3:
      return StoreStatusTypeEnum[value];
    default:
      throw new Error("Invalid StoreStatus input");
  }
}

export interface StoreOwner {
  id: string;
  zoneId: string;
  marketZoneId: string;
  description: string | null;
  name: string;
  address: string;
  phoneNumber: string;
  shortName: string | null;
  email: string;
  storeType: StoreTypeEnum | number;
  zoneName: string;
  status: StoreStatusTypeEnum | number;
  deflag: boolean;
  crDate: string;
  upsDate: string;
  menus?: StoreMenu[];
  wallets?: WalletStoreDetail[];
}

export interface StoreOwnerDetail {
  storeType?: StoreTypeEnum | string;
  store: StoreOwner;
}

interface WalletStoreDetail {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
  balance: number;
  balanceHistory: number;
  balanceStart: number;
  userId: string;
  storeId: string;
  walletTypeId: string;
  packageOrderId: string | null;
  startDate: string | null;
  endDate: string | null;
  deflag: boolean;
  packageOrder: null;
  store: null;
  user: null;
  walletType: WalletType;
  transactions: [];
}

export interface StoreOwnerPatch {
  name: string;
  address: string;
  phoneNumber: string;
  shortName: string | null;
  email: string;
  description: string | null;
  status: StoreStatusTypeEnum | number;
  storeType: StoreTypeEnum | number;
}
