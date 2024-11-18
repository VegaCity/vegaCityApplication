export interface GetWalletType {
  id: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
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
