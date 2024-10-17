export interface HouseType {
  houseName: string;
  location: string;
  address: string;
  zoneId: string;
  deflag: boolean;
  isRent: boolean;
}

export interface HouseTypeId extends HouseType {
  id: string;
}

export interface StoreHouseType {
  id: string;
  houseName: string;
  location: string;
  address: string;
  zoneId: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  isRent: boolean;
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
      houseId: string;
      description: string | null;
      status: number;
    }
  ];
}
