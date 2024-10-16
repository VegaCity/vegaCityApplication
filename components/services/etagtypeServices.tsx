import { API } from "@/components/services/api";
import {
  EtagTypePatch,
  EtagTypePost,
  ETagTypePackageParams,
} from "@/types/etagtype";

interface ETagPageSize {
  page?: number;
  size?: number;
}

export const ETagTypeServices = {
  getETagTypes({ page, size }: ETagPageSize) {
    return API.get("/etag-types", {
      params: {
        page,
        size,
      },
    });
  },
  getETagTypeById(id: string) {
    return API.get(`/etag-type/${id}`);
  },

  uploadEtagType(etagtypeData: EtagTypePost) {
    return API.post("/etag-type/", etagtypeData);
  },
  editEtagType(etagtypeId: string, etagtypeData: EtagTypePatch) {
    return API.patch(`/etag-type/${etagtypeId}`, etagtypeData);
  },
  deleteEtagTypeById(id: string) {
    return API.delete(`/etag-type/${id}`);
  },
  addEtagTypeToPackage({
    etagTypeId,
    packageId,
    quantityEtagType,
  }: ETagTypePackageParams) {
    return API.post(`/etag-type/${etagTypeId}/package/${packageId}`, null, {
      params: {
        quantityEtagType,
      },
    });
  },
};
