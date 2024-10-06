import { API } from "@/components/services/api";
import { EtagType, EtagTypePost } from "@/types/etagtype";

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
  editEtagType(etagtypeId: string, etagtypeData: EtagType) {
    return API.patch(`/etag-type/${etagtypeId}`, etagtypeData);
  },
  deleteEtagTypeById(id: string) {
    return API.delete(`/etag-type/${id}`);
  },
};
