// etag.ts

export interface Wallet {
  balance: number;
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
  vcard: Vcard;
}
export interface Vcard {
  id: string;
  imageUrl: string;
  name: string;
  phoneNumber: string;
  email: string;
}
export interface PackageItemHandleUpdate {
  name: string;
  imageUrl: string | null;
  gender: string;
}
