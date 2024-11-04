export interface Zone {
  id: string;
  marketZoneId: string;
  name: string;
  location: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
}

export interface ZoneDetail {
  id: string;
  marketZoneId: string;
  name: string;
  location: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  marketZone: null;
  packageTypes: [];
  stores: [
    {
      id: string;
      storeType: number | null;
      name: string;
      address: string;
      crDate: string;
      upsDate: string;
      deflag: boolean;
      phoneNumber: string;
      shortName: string | null;
      email: string;
      zoneId: string | null;
      marketZoneId: string;
      description: string | null;
      status: boolean;
      zone: null;
      menus: [];
      orders: [];
      storeMoneyTransfers: [];
      storeServices: [];
      transactions: [];
      userStoreMappings: [];
      wallets: [];
    }
  ];
  userSessions: [];
}

export interface ZoneTypePost {
  name: string;
  location: string;
}

export interface ZoneTypePatch {
  zoneName: string;
  zoneLocation: string;
}
