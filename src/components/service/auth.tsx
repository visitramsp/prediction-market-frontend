import { getErrorMessage } from "@/utils/Content";
import apiInstance from "./apiInstance";
import { API_URLs } from "./apiURLs";

export const registerAPI = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.register, reqBody);

    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const loginAPI = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.login, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const googleLoginAPI = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.googleLogin, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const emailVerifyAPI = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.verifyEmail, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
