import { API } from "@/components/services/api";
import {
  StoreService,
  CreateStoreServiceRequest,
  UpdateStoreServiceRequest,
} from "@/types/serviceStore";

interface StorePageSize {
  page?: number;
  size?: number;
}

export const StoreServiceServices = {
  getStores({ page, size }: StorePageSize) {
    return API.get("/service-stores", {
      params: {
        page,
        size,
      },
    });
  },
  getStoreById(id: string) {
    return API.get(`/service-store/${id}`);
  },
  createStore(storeData: CreateStoreServiceRequest) {
    return API.post("/service-store", storeData);
  },
  editStore(servicestoreId: string, store: UpdateStoreServiceRequest) {
    return API.patch(`/service-store/${servicestoreId}`, store);
  },
  deleteStoreById(id: string) {
    return API.delete(`/service-store/${id}`);
  },
};
