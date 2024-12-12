export enum PromotionStatus {
  Active = 0,
  Inactive = 1,
  Expired = 2,
  Automation = 3,
}

//handle User status from number to string
export const handlePromotionStatusFromBe = (status: number): string => {
  switch (status) {
    case 0:
    case 1:
    case 2:
    case 3:
      return PromotionStatus[status]; //Returns the enum label as string
    default:
      throw new Error("Invalid promotions input"); // Optional: handle invalid input
  }
};

export interface Promotion {
  id: string;
  marketZoneId: string;
  name: string;
  promotionCode: string;
  description: string | null;
  maxDiscount: number | null;
  quantity: number | null;
  discountPercent: number | null;
  requireAmount: number | null;
  status: number;
  startDate: string;
  endDate: string;
  marketZone: null;
  statusCode: number;
  messageResponse: null;
  data: null;
}

export interface PromotionPatch {
  name: string;
  description: string | null;
  maxDiscount: number | null;
  requireAmount: number | null;
  quantity: number | null;
  discountPercent: number | null;
  startDate: string;
  endDate: string;
  status?: string | number | null;
}

export interface PromotionPost extends PromotionPatch {
  promotionCode: string;
}
