export interface PackageType {
  id: string;
  zoneId: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  statusCode: number;
  //   messageResponse: null;
  //   data: null;
}

export interface PackageTypeDetail {
  id: string;
  zoneId: string;
  name: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  zone: null;
  packages: [
    {
      id: string;
      imageUrl: string | null;
      name: string;
      description: string | null;
      price: number;
      crDate: string;
      upsDate: string;
      deflag: boolean;
      duration: number;
      packageTypeId: string;
      packageType: null;
      orders: [];
      packageDetails: [];
      packageItems: [];
      packageOrders: [];
    }
  ];
}

export interface PackageTypePatch {
  name: string;
}

export interface PackageTypePost extends PackageTypePatch {
  zoneId: string;
}
