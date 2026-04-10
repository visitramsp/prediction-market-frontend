import { getErrorMessage } from "@/utils/Content";
import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";

export const getCommonCategoryAll = async () => {
  try {
    const response = await apiInstance.get(API_URLs.commonCategoryAll);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const commonQuestionFindById = async (
  id: number,
  // userId: string,
  subCategoryId: number | null,
  sortBy: string,
  frequency: string,
  status: string,
  search: string,
  excludeCategories: number[],
  limit: number = 12,
  offset: number = 0,
) => {
  // ?categoryId=
  try {
    const response = await apiInstance.get(API_URLs.commonQuestionFindById, {
      params: {
        categoryId: id,
        ...(subCategoryId && { eventSectionId: subCategoryId }),
        ...(sortBy && { sortBy }),
        ...(frequency && { frequency }),
        ...(status && { status: status == "Active" ? "OPEN" : "RESOLVED" }),
        ...(search && { search }),
        ...(excludeCategories?.length > 0 && {
          excludeCategories: excludeCategories,
        }),
        limit,
        offset,
      },
    });

    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const questionDetails = async (id: string, userId: number) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.questionDetails}/${id}${userId ? `?userId=${userId}` : ""}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const fetchSubCategory = async (id: number) => {
  try {
    const response = await apiInstance.get(`${API_URLs.subCategory}/${id}`);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
