import { API } from "@/components/services/api";
import { PromotionPatch, PromotionPost } from "@/types/promotion/Promotion";

interface PromotionPageSize {
  page?: number;
  size?: number;
}

export const PromotionServices = {
  getPromotions({ page, size }: PromotionPageSize) {
    return API.get("/promotions", {
      params: {
        page,
        size,
      },
    });
  },
  getPromotionById(id: string) {
    return API.get(`/promotion/${id}`);
  },
  uploadPromotion(promotionData: PromotionPost) {
    return API.post("/promotion/", promotionData);
  },
  editPromotion(promotionId: string, promotionData: PromotionPatch) {
    return API.patch(`/promotion/${promotionId}`, promotionData);
  },
  deletePromotionById(id: string) {
    return API.delete(`/promotion/${id}`);
  },
};
