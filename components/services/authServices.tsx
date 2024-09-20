import { API } from "@/components/services/api"
import { LoginAccount } from "@/types/loginAccount";


export const AuthServices = {
    loginUser(data: LoginAccount) {
      return API.post('/auth/login', data);
    },
    fetchUser(email: String, refreshToken: String) {
      const fetchData = { email, refreshToken };
      return API.post('/auth/refresh-token', fetchData);
    },
    logoutUser() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      
    }
  }
  