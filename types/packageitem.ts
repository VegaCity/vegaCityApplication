// etag.ts

export interface Wallet {
  id: string;
  walletTypeId: string;
  crDate: string;
  upsDate: string;
  balance: number;
  balanceHistory: number;
  deflag: boolean;
}

export interface PackageItem {
  id: string;
  packageId: string;
  crDate: string;
  upsDate: string;
  name: string;
  phoneNumber: string;
  cccdpassport: string;
  email: string;
  imageUrl: string;
  gender: string;
  isAldult: boolean;
  birthday: string | null;
  deflag: boolean;
  status: string;
  walletId: string;
  isVerifyPhone: boolean;
  wallet: Wallet;
}

export interface PackageItemHandleUpdate {
  phoneNumber: string;
  gender: string;
  birthday: string;
}
