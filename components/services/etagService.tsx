import { API } from "@/components/services/api";
import { ETag } from "@/types/etag";

interface ETagPageSize {
  page?: number;
  size?: number;
}

export interface GenerateEtag {
  quantity?: number;
  etagTypeId?: string;
  generateEtagRequest: {
    startDate: string;
    endDate: string;
    day: number;
  };
}

interface ActivateEtagRequest {
  cccd: string;
  name: string;
  phone: string;
  gender: string;
  birthday: string;
  startDate: string;
  endDate: string;
}
interface ChargeMoneyRequest {
  etagCode: string;
  chargeAmount: number;
  cccd: string;
  paymentType: string;
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
export const ETagServices = {
  getETags({ page, size }: ETagPageSize) {
    return API.get("/etags", {
      params: {
        page,
        size,
      },
    });
  },
  getETagById(id: string) {
    return API.get(`/etag/${id}`);
  },
  uploadEtag(etagData: ETag) {
    return API.post("/etag/", etagData);
  },
  editEtag(id: string, etagData: ETag) {
    return API.patch(`/etag/${id}`, etagData);
  },
  deleteEtagById(id: string) {
    return API.delete(`/etag/${id}`);
  },
  generateEtag({ quantity, etagTypeId, generateEtagRequest }: GenerateEtag) {
    console.log("Sending generateEtag request with:", {
      quantity,
      etagTypeId,
      generateEtagRequest,
    });
    return API.post("/generate-etag", generateEtagRequest, {
      params: {
        quantity,
        etagTypeId,
      },
    });
  },
  activateEtag(id: string, activateData: ActivateEtagRequest) {
    return API.patch(`/etag/${id}/activate`, activateData);
  },
  chargeMoney({
    etagCode,
    chargeAmount,
    cccd,
    paymentType,
  }: ChargeMoneyRequest) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    const chargeData = {
      userId,
      etagCode,
      chargeAmount,
      cccd,
      paymentType,
    };

    return API.post("/etag/charge-money", chargeData);
  },
};
