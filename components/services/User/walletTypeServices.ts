import { API } from "@/components/services/api";
import { PostPatchWalletType } from "@/types/walletType/walletType";

interface WalletTypePageSize {
  page?: number;
  size?: number;
}
export const WalletTypeServices = {
  getWalletTypes({ page, size }: WalletTypePageSize) {
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
  createWalletType(welletTypeData: PostPatchWalletType) {
    return API.post("/wallet-type/", welletTypeData);
  },
  updateWalletTypeById(
    walletTypeId: string,
    welletTypeData: PostPatchWalletType
  ) {
    return API.patch(`/wallet-type/${walletTypeId}`, welletTypeData);
  },
  deleteWalletTypeById(walletTypeId: string) {
    return API.delete(`/wallet-type/${walletTypeId}`);
  },
};
