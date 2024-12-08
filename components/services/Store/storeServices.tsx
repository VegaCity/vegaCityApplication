import { API, API_LOCAL, apiKey } from "@/components/services/api";
import {
  StoreOwnerPatch,
  StoreOwnerPatchStore,
} from "@/types/store/storeOwner";

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
  editStoreProfile(storeId: string, storeData: StoreOwnerPatchStore) {
    return API.patch(`/store/${storeId}`, storeData);
  },
  deleteStoreById(id: string) {
    return API.delete(`/store/${id}`);
  },
  getWalletForStore(storeName: string, phoneNumber: string) {
    return API.post("/store/wallet", {
      storeName,
      phoneNumber,
    });
  },
  updateMenu(phone: string) {
    return API_LOCAL.get(`/store/${phone}/menu`);
  },
};
