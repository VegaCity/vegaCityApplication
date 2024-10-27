import { API } from "@/components/services/api";
import { ETag, ETagHandleUpdate } from "@/types/etag";

interface ETagPageSize {
  page?: number;
  size?: number;
}

export interface GenerateEtag {
  quantity?: number;
  etagTypeId?: string;
  generateEtagRequest: {
    startDate: Date;
    endDate: Date;
    // day: number;
  };
}

export interface ActivateEtagRequest {
  cccdPassport: string;
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
  cccdPassport: string;
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
  getETagById(idOrEtagCode: string) {
    const params: { id?: string; etagCode?: string } = {};

    if (idOrEtagCode.startsWith("VG")) {
      params.etagCode = idOrEtagCode;
    } else {
      params.id = idOrEtagCode;
    }

    return API.get("/etag", { params });
  },

  uploadEtag(etagData: ETag) {
    return API.post("/etag/", etagData);
  },
  editEtag(id: string, etagData: ETag) {
    return API.patch(`/etag/${id}`, etagData);
  },
  editInfoEtag(id: string, etagData: ETagHandleUpdate) {
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
    cccdPassport,
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
      cccdPassport,
      paymentType,
    };

    return API.post("/etag/charge-money", chargeData);
  },
};
