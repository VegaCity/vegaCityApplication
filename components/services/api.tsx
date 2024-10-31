import axios from "axios";

// const BASE_URL = 'https://vega.vinhuser.one/api/v1';
const BASE_URL = "https://api.vegacity.id.vn/api/v1";
export const apiKey = "5f728deb-b2c3-4bac-9d9c-41a11e0acccc";

export const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log("Authorization Header:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    return Promise.reject(error);
  }
);

// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error?.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         // Thay đổi endpoint và logic để làm mới token của bạn
//         const response = await axios.post(
//           `https://vega.vinhuser.one/api/v1/auth/refresh-token`,
//           {
//             refreshToken: localStorage.getItem("refreshToken"),
//           }
//         );
//         const { accessToken } = response.data;
//         localStorage.setItem("accessToken", accessToken);
//         API.defaults.headers.Authorization = `Bearer ${accessToken}`;
//         return API(originalRequest);
//       } catch (refreshError) {
//         // Xử lý lỗi làm mới token
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );
