export const handleWalletTypeFromBe = (status: boolean): string => {
  if (status) {
    return "InActive";
  } else {
    return "Active";
  }
};

export interface GetWalletType {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
}

export interface WalletType {
  id: string;
  name: string;
  marketZoneId: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  marketZone: null;
  packageDetails: [];
  walletTypeMappings: [];
  wallets: [null];
}

export interface GetWalletTypeById extends GetWalletType {
  etagTypes: [];
  walletTypeStoreServiceMappings: [
    {
      id: string;
      walletTypeId: string;
      storeServiceId: string;
      crDate: string;
      upsDate: string;
      storeService: null;
      walletType: null;
    }
  ];
}

// export interface WalletTypeServiceStore {}

export interface WalletTypePostPatch {
  name: string;
}
