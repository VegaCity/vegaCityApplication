export interface ZoneType {
  id: string,
  marketZoneId: string,
  name: string,
  location: string,
  crDate: string,
  upsDate: string,
  deflag: boolean,
  houses: [],
}

export interface ZoneTypePost {
  name: string;
  location: string;
}

export interface ZoneTypePatch {
  name: string;
  location: string;
}
  