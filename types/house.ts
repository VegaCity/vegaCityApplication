export interface HouseTypePatch {
  id: string;
  houseName: string;
  location: string;
  address: string;
}

export interface HouseType extends HouseTypePatch {
  zoneId: string;
  deflag: boolean;
  isRent: boolean;
}
