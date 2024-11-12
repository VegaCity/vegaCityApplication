import { API } from "@/components/services/api";
import { Users } from "@/types/user/user";
import {
  UserAccountPostPatch,
  UserAccountPost,
  UserApprove,
} from "@/types/user/userAccount";

interface UserPageSize {
  page?: number;
  size?: number;
}
export const UserServices = {
  getUsers({ page, size }: UserPageSize) {
    return API.get("/users", {
      params: {
        page,
        size,
      },
    });
  },
  getUserById(userId: string) {
    return API.get(`/user/${userId}`);
  },
  createUser(userData: UserAccountPostPatch) {
    return API.post("/user/", userData);
  },
  updateUserById(userId: string, userData: UserAccountPost) {
    return API.patch(`/user/${userId}`, userData);
  },
  deleteUserById(userId: string) {
    return API.delete(`/user/${userId}`);
  },
  userReassignEmail(userId: string, email: string) {
    return API.post(`/user/${userId}/re-assign-email`, email);
  },
  approveUser(userId: string, userApproveData: UserApprove) {
    return API.post(`/user/${userId}/approve-user`, userApproveData);
  },
  uploadPackage(userData: Users) {
    return API.post("/user/", userData);
  },
  editPackage(userId: string, userData: Users) {
    return API.patch(`/user/${userId}`, userData);
  },
  deletePackageById(id: string) {
    return API.delete(`/user/${id}`);
  },
};
