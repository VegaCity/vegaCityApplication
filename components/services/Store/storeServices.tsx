import { API, apiKey } from "@/components/services/api";
import { StoreOwnerPatch } from "@/types/storeOwner";

interface StorePageSize {
  // apiKey: string;
  apiKey?: string;
  page?: number;
  size?: number;
}

export const StoreServices = {
  getStores({ page, size }: StorePageSize) {
    return API.get("/stores", {
      params: {
        apiKey: apiKey,
        page,
        size,
      },
    });
  },
  getStoreById(id: string) {
    return API.get(`/store/${id}`);
  },
  editStore(storeId: string, storeData: StoreOwnerPatch) {
    return API.patch(`/store/${storeId}`, storeData);
  },
  deleteStoreById(id: string) {
    return API.delete(`/store/${id}`);
  },
};
