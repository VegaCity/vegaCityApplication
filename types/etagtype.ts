export interface EtagType {
  id: string;
  name: string;
  imageUrl?: string;
  bonusRate: number;
  amount: number;
}

export interface EtagTypePost {
  name: string;
  imageUrl?: string;
  bonusRate: number;
  amount: number;
  walletTypeId: string;
}

export interface EtagTypePatch {
  name: string;
  imageUrl?: string;
  bonusRate: number;
  amount: number;
}
export interface ETagTypePackageParams {
  etagTypeId: string;
  packageId: string;
  quantityEtagType?: number;
}

export interface EtagTypeMappings extends EtagType {
  deflag: boolean;
  walletTypeId: string;
}
