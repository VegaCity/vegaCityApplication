import { API } from "@/components/services/api";
import { PackageItem, PackageItemHandleUpdate } from "@/types/packageitem";

interface PackageItemPageSize {
  page?: number;
  size?: number;
}

export interface GeneratePackageItem {
  quantity?: number;
  generatePackageItemRequest: {
    packageId?: string;
  };
}

export interface ActivatePackageItemRequest {
  cccdPassport: string;
  name: string;
  phoneNumber: string;
  gender: string;
  email?: string;
  isAdult: boolean;
}

interface ChargeMoneyRequest {
  chargeAmount: number;
  cccdPassport: string;
  paymentType: string;
  packageItemId: string;
}

interface ChargeMoneyResponse {
  statusCode: number;
  messageResponse: string;
  data: {
    invoiceId: string;
    balance: number;
    key: string;
    urlDirect: string;
    urlIpn: string;
  };
}

interface PaymentRequestBody {
  productId: string;
  quantity: number;
  note: string;
  price: number;
}

export const PackageItemServices = {
  getPackageItems({ page, size }: PackageItemPageSize) {
    return API.get("/package-items", {
      params: {
        page,
        size,
      },
    });
  },

  getPackageItemById(id: string) {
    return API.get(`/package-item/?id=${id}`);
  },

  uploadPackageItem(PackageItem: PackageItem) {
    return API.post("/package-item/", PackageItem);
  },

  editPackageItem(id: string, PackageItem: PackageItem) {
    return API.patch(`/package-item/${id}`, PackageItem);
  },

  editInfoPackageItem(id: string, PackageItem: PackageItemHandleUpdate) {
    return API.patch(`/package-item/${id}`, PackageItem);
  },

  deletePackageItemById(id: string) {
    return API.delete(`/package-item/${id}`);
  },

  generatePackageItem(quantity: number) {
    const packageId = localStorage.getItem("packageId");
    if (!packageId) {
      throw new Error("Package ID not found in localStorage");
    }

    return API.post(`/package-item?quantity=${quantity}`, {
      packageId: packageId,
    });
  },

  activatePackageItem(id: string, activateData: ActivatePackageItemRequest) {
    return API.patch(`/package-item/${id}/activate`, activateData);
  },

  chargeMoney({
    packageItemId,
    chargeAmount,
    cccdPassport,
    paymentType,
  }: ChargeMoneyRequest) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    const chargeData = {
      packageItemId,
      chargeAmount,
      cccdPassport,
      paymentType,
    };

    return API.post("/package-item/charge-money", chargeData);
  },
};
