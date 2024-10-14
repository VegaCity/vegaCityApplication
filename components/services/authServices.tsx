import { API } from "@/components/services/api";
import { LoginAccount } from "@/types/loginAccount";

export const AuthServices = {
  loginUser(data: LoginAccount) {
    return API.post("/auth/login", data);
  },
  fetchUser(email: string, refreshToken: string) {
    const fetchData = { email, refreshToken };
    return API.post("/auth/refresh-token", fetchData);
  },
  fetchUserByEmail(email: string) {
    const encodedEmail = encodeURIComponent(email);
    console.log(encodedEmail, "encode email");
    return API.get(`/auth/refresh-token/${encodedEmail}`);
  },
  logoutUser() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
  },
};
