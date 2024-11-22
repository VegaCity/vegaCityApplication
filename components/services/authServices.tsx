import { API } from "@/components/services/api";
import { LoginAccount } from "@/types/loginAccount";
export interface ChangePasswordPayload {
  apiKey: string;
  email: string;
  oldPassword: string;
  newPassword: string;
}
export const DEFAULT_API_KEY = "5f728deb-b2c3-4bac-9d9c-41a11e0acccc";
export const AuthServices = {
  loginUser(data: LoginAccount) {
    return API.post("/auth/login", data);
  },
  fetchUser(email: string, refreshToken: string) {
    const apiKey: string = "5f728deb-b2c3-4bac-9d9c-41a11e0acccc";
    const fetchData = { email, refreshToken, apiKey };
    console.log(fetchData, "fetch Usersss");
    return API.post("/auth/refresh-token", fetchData);
  },
  fetchUserByEmail(email: string) {
    // const encodedEmail = encodeURIComponent(email);
    // console.log(encodedEmail, "encode email");
    const apiKey: string = "5f728deb-b2c3-4bac-9d9c-41a11e0acccc";
    return API.post(`/auth/refresh-token/${email}`, {
      headers: { "Content-Type": "application/json" },
      apiKey,
    });
  },
  logoutUser() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    return "logout";
  },
  changePassword(data: Omit<ChangePasswordPayload, "apiKey">) {
    const payload = {
      ...data,
      apiKey: DEFAULT_API_KEY,
    };
    return API.post("/auth/change-password", payload);
  },
};
