import { API } from "@/components/services/api";
import { WalletTypePostPatch } from "@/types/walletType/walletType";

interface WalletTypesPageSize {
  page?: number;
  size?: number;
}
export const WalletTypesServices = {
  getWalletTypes({ page, size }: WalletTypesPageSize) {
    return API.get("/wallet-types", {
      params: {
        page,
        size,
      },
    });
  },
  getWalletTypeById(walletTypeId: string) {
    return API.get(`/wallet-type/${walletTypeId}`);
  },
  createWalletType(welletTypeData: WalletTypePostPatch) {
    return API.post("/wallet-type/", welletTypeData);
  },
  updateWalletTypeById(
    walletTypeId: string,
    welletTypeData: WalletTypePostPatch
  ) {
    return API.patch(`/wallet-type/${walletTypeId}`, welletTypeData);
  },
  deleteWalletTypeById(walletTypeId: string) {
    return API.delete(`/wallet-type/${walletTypeId}`);
  },
};
