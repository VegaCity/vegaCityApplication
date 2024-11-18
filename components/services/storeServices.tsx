import { API } from "@/components/services/api";

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
    return API.get(`/store/${id}`);
  },
};
