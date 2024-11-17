// etag.ts

export interface Wallet {
  id: string;
  walletTypeId: string;
  crDate: string;
  upsDate: string;
  balance: number;
  balanceHistory: number;
  deflag: boolean;
  walletType: WalletType;
}
export interface WalletType {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
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
  isAdult: boolean;
  birthday: string | null;
  deflag: boolean;
  status: string;
  walletId: string;
  isVerifyPhone: boolean;
  wallets: Wallet[];
}

export interface PackageItemHandleUpdate {
  name: string;
  imageUrl: string | null;
  gender: string;
}
