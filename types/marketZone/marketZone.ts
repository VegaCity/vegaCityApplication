export interface MarketZone {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  description: string | null;
  address: string;
  phoneNumber: string;
  email: string;
  shortName: string | null;
  deflag: boolean;
  crDate: string;
  upsDate: string;
}

export interface MarketZoneDetail extends MarketZone {
  marketZoneConfig: null;
  customerMoneyTransfers: [];
  promotions: [];
  storeMoneyTransfers: [];
  users: [];
  walletTypes: [];
  zones: [];
}

export interface MarketZonePostPatch {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  description: string | null;
  address: string;
  phoneNumber: string;
  email: string;
  cccdPassport: string;
  shortName: string | null;
}
