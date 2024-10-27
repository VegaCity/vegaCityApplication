import { API } from "@/components/services/api";
import {
  PatchServicesStore,
  PostServicesStore,
} from "@/types/serviceStore/serviceStore";

interface ServiceStoresPageSize {
  page?: number;
  size?: number;
}

export const ServiceStoreServices = {
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
  createServicesStore(serviceStoreData: PostServicesStore) {
    return API.post("/service-store/", serviceStoreData);
  },
  editServiceStore(
    serviceStoreId: string,
    serviceStoreData: PatchServicesStore
  ) {
    return API.patch(`/service-store/${serviceStoreId}`, serviceStoreData);
  },
  deleteServiceStoreById(id: string) {
    return API.delete(`/service-store/${id}`);
  },
};
