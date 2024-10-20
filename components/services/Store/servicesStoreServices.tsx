import { API } from "@/components/services/api";
import { PatchServicesStore } from "@/types/PATCH/servicesStore/patchServiceStoreType";

interface ServiceStoresPageSize {
  page?: number;
  size?: number;
}

export const StoreServices = {
  getServiceStores({ page, size }: ServiceStoresPageSize) {
    return API.get("/service-stores", {
      params: {
        page,
        size,
      },
    });
  },
  getServicesStoreById(id: string) {
    return API.get(`/service-store/${id}`);
  },
  editStore(storeId: string, storeData: PatchServicesStore) {
    return API.patch(`/service-store/${storeId}`, storeData);
  },
  deleteStoreById(id: string) {
    return API.delete(`/service-store/${id}`);
  },
};
