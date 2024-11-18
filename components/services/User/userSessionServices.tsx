import { API } from "@/components/services/api";
import { UserSessionPost } from "@/types/user/userSession";

interface UserSessionPageSize {
  page?: number;
  size?: number;
}
export const UserSessionServices = {
  getUserSessions({ page, size }: UserSessionPageSize) {
    return API.get("/user/sessions", {
      params: {
        page,
        size,
      },
    });
  },
  getUserSessionById(userSessionId: string) {
    return API.get(`/user/session/${userSessionId}`);
  },
  createUserSessionById(userId: string, userSessionData: UserSessionPost) {
    return API.post(`/user/${userId}/session`, userSessionData);
  },
  deleteUserSessionById(userSessionId: string) {
    return API.delete(`/user/session/${userSessionId}`);
  },
};
