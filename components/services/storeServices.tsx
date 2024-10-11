import { API } from "@/components/services/api";
import { StoreOwnerPatch } from "@/types/storeOwner";

interface StorePageSize {
  page?: number;
  size?: number;
}

export const StoreServices = {
  getStores({ page, size }: StorePageSize) {
    return API.get("/stores", {
      params: {
        page,
        size,
      },
    });
  },
  getStoreById(id: string) {
    return API.get(`/stores/${id}`);
  },
  editStore(storeId: string, storeData: StoreOwnerPatch) {
    return API.patch(`/store/${storeId}`, storeData);
  },
  deleteStoreById(id: string) {
    return API.delete(`/store/${id}`);
  },
};
