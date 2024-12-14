import { API } from "@/components/services/api";
import {
  StoreMenu,
  StoreMenuPost,
  StoreMenuPatch,
} from "@/types/store/storeMenu";

interface StoreMenuPageSize {
  page?: number;
  size?: number;
}

export const StoreMenuServices = {
  getStoreMenus({ page, size }: StoreMenuPageSize & { storeId: string }) {
    const storeId = localStorage.getItem("storeId");
    return API.get(`/store/${storeId}/menus`, {
      params: {
        page,
        size,
      },
    });
  },

  getStoreMenuById(id: string) {
    return API.get(`/store/menu/${id}`);
  },
  createStoreMenu(storeId: string, storeMenuData: StoreMenuPost) {
    return API.post(`/store/${storeId}/menu/`, storeMenuData);
  },

  editStoreMenu(storeMenuId: string, storeMenuData: StoreMenuPatch) {
    return API.patch(`/store/menu/${storeMenuId}`, storeMenuData);
  },
  deleteStoreMenuById(id: string) {
    return API.delete(`/store/menu/${id}`);
  },
  addProductToMenu(
    menuId: string,
    productData: {
      name: string;
      productCategoryId: string;
      price: number;
      imageUrl: string;
      quantity: number;
    }
  ) {
    return API.post(`/store/menu/${menuId}/product`, productData);
  },
};
