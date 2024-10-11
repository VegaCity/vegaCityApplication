export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  crDate: string;
  upsDate: string;
  deflag: boolean;
  imageUrl: string | null;
  marketZone: any | null;
  packageETagTypeMappings: any | null;
  statusCode: number;
  messageResponse: string | null;
  data: any | null;
}

export interface PackagePostPatch {
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
}
