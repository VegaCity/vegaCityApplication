export enum PackageTypesEnum {
  SpecificPackage = 0,
  ServicePackage = 1,
}

export interface Package {
  id: string;
  type: string;
  zoneId: string;
  imageUrl?: string | null;
  name: string;
  description: string | null;
  price: number;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  duration: number;
}

export interface PackageDetailType {
  id: string;
  type: string;
  zoneId: string;
  imageUrl?: string | null;
  name: string;
  description: string | null;
  price: number;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  zone: null;
  duration: number;
  orders: [];
  packageDetails: PackageDetails[];
  packageOrders: PackageOrder[];
}

export interface PackagePost {
  type: string;
  zoneId: string;
  imageUrl?: string | null;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  walletTypeId: string;
  moneyStart: number;
}

export interface PackagePatch {
  imageUrl?: string | null;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

export interface PackageOrder {
  id: string;
  packageId: string;
  vcardId: string | null;
  cusName: string;
  cusEmail: string;
  cusCccdpassport: number;
  phoneNumber: number;
  crDate: string;
  upsDate: string;
  status: "Active" | "InActive" | "Blocked" | "Expired" | string; //PENDING
  startDate: string | null;
  endDate: string | null;
  isAdult: boolean;
  package: null;
  vcard: null;
  customerMoneyTransfers: [];
  orders: [];
  wallets: [];
}

interface PackageDetails {
  id: string;
  packageId: string;
  walletTypeId: string;
  startMoney: number;
  crDate: string;
  package: null;
  walletType: {
    id: string;
    name: string;
    marketZoneId: string;
    crDate: string;
    upsDate: string;
    deflag: boolean;
    marketZone: null;
    packageDetails: [null];
    walletTypeMappings: [];
    wallets: [];
  };
}
