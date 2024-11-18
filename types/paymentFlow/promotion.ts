export interface Promotion {
  id: string;
  MarketZoneId: string;
  Name: string;
  PromotionCode: string;
  Description: string | null;
  MaxDiscount: number | null;
  Quantity: number | null;
  DiscountPercent: number | null;
  Status: string;
  StartDate: string;
  EndDate: string;
}

export interface PromotionPost {
  marketZoneId: string;
  name: string;
  promotionCode: string;
  description: string;
  maxDiscount: number;
  quantity: number;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

export interface PromotionPatch {
  name: string;
  description: string;
  maxDiscount: number;
  quantity: number;
  discountPercent: number;
  startDate: string;
  endDate: string;
}
