import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";
import { getErrorMessage } from "@/utils/Content";

export const getCountryList = async () => {
  try {
    const response = await apiInstance.get(`${API_URLs.countriesList}`);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getStates = async (countryId: number) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.statesList}/${countryId}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getCities = async (stateId: number) => {
  try {
    const response = await apiInstance.get(`${API_URLs.citiesList}/${stateId}`);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getResponser = async (reqBody: any) => {
  try {
    const response = await apiInstance.post(API_URLs.getResponser, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
