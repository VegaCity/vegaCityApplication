import { EtagType } from "@/types/etagtype";

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
  packageETagTypeMappings:
    | [
        {
          crDate: string;
          etagType: EtagType;
          etagTypeId: string;
          id: string;
          packageId: string;
          quantityEtagType: number;
          upsDate: string;
        }
      ]
    | null;
}

export interface PackagePostPatch {
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
}
