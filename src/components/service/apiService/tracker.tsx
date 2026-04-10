import { getErrorMessage } from "@/utils/Content";
import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";

export const fetchTrackerDashboard = async (
  period = "month",
  sections = "all",
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.trackerDashboard}?period=${period}&sections=${sections}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
