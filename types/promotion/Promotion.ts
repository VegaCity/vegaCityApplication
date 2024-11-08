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
}

export interface PromotionPost extends PromotionPatch {
  promotionCode: string;
}
