// etag.ts

export interface ETagType {
  id: string;
  name: string;
  marketZoneId: string;
  imageUrl: string;
  bonusRate: number;
  deflag: boolean;
  amount: number;
  walletTypeId: string;
}

export interface MarketZone {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  shortName: string;
  deflag: boolean;
  crDate: string;
  upsDate: string;
}

export interface Wallet {
  id: string;
  walletTypeId: string;
  crDate: string;
  upsDate: string;
  balance: number;
  balanceHistory: number;
  deflag: boolean;
}

export interface ETag {
  id: string;
  etagCode: string;
  fullName: string;
  phoneNumber: string;
  cccd: string;
  imageUrl: string;
  gender: string;
  birthday: string | null;
  qrCode: string;
  deflag: boolean;
  startDate: string;
  endDate: string;
  status: number;
  crDate: string;
  upsDate: string;
  etagTypeId: string;
  marketZoneId: string;
  walletId: string;
  isVerifyPhone: boolean;
  etagType: ETagType;
  marketZone: MarketZone;
  wallet: Wallet;
}

export interface ETagHandleUpdate {
  phoneNumber: string;
  gender: string;
  birthday: string;
}