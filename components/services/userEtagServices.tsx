import { API } from "@/components/services/api";
import { UserEtag, UserEtagPatch } from "@/types/userEtag";

interface UserEtagPageSize {
  page?: number;
  size?: number;
}

export const UserEtagServices = {
  getEtags({ page, size }: UserEtagPageSize) {
    return API.get("/etags", {
      params: {
        page,
        size,
      },
    });
  },
  getEtagById(userId: string) {
    return API.get(`/etag/${userId}`);
  },
  uploadEtag(userEtagData: UserEtag) {
    return API.post("/etag/", userEtagData);
  },
  editEtag(userId: string, userEtagData: UserEtagPatch) {
    return API.patch(`/etag/${userId}`, userEtagData);
  },
  deleteEtagById(id: string) {
    return API.delete(`/etag/${id}`);
  },
};
