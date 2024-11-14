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
  promoCode: string;
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
interface GetPackageItemByIdParams {
  id?: string;
  rfId?: string;
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

  getPackageItemById({ id, rfId }: GetPackageItemByIdParams) {
    if (id) {
      return API.get(`/package-item/?id=${id}`);
    } else if (rfId) {
      return API.get(`/package-item/?rfId=${rfId}`);
    } else {
      throw new Error("Either 'id' or 'rfId' must be provided.");
    }
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
    return API.post(`/package-item?quantity=${quantity}`, {
      packageId: localStorage.getItem("packageId"),
    });
  },
  generatePackageItemForChild(quantity: number) {
    return API.post(`/package-item?quantity=${quantity}`, {
      packageId: localStorage.getItem("packageId"),
      startDate: localStorage.getItem("startDate"),
      endDate: localStorage.getItem("endDate"),
      packageItemId: localStorage.getItem("packageItemId"),
    });
  },
  generatePackageItemLost(quantity: number) {
    return API.post(`/package-item?quantity=${quantity}`, {
      packageItemId: localStorage.getItem("packageItemIdLost"),
    });
  },

  activatePackageItem(id: string, activateData: ActivatePackageItemRequest) {
    return API.patch(`/package-item/${id}/activate`, activateData);
  },
  updateRFID(id: string, rfId: string) {
    return API.patch(`/package-item/${id}/rfid?rfId=${rfId}`, {
      id: id,
      rfId: rfId,
    });
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
  lostPackageItem(data: {
    fullName: string;
    cccdpassport: string;
    email: string;
    phoneNumber: string;
  }) {
    return API.post("/package-item/mark-lost", data);
  },
};
