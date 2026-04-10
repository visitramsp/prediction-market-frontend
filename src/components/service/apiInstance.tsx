import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logout } from "../store/slice/auth";
//
// export const basedURLs = "http://192.168.29.218:3000";
// export const basedURLs = "http://localhost:2000";
export const basedURLs = "http://192.168.29.162:2000";
// export const basedURLs = "https://api.opinionkings.com";
export const developmentBaseURL = `${basedURLs}/api`;

const apiInstance = axios.create({
  baseURL: developmentBaseURL,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
if (typeof window !== "undefined") {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token") || "";
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const isToken = localStorage.getItem("token");
      // console.log(status, isToken, "status");
      if (status === 401 && isToken) {
        toast.success("Token expired 🚫 Logging out...");
        localStorage.clear();
        window.location.href = "/";
      }

      return Promise.reject(error);
    },
  );
}

export default apiInstance;
