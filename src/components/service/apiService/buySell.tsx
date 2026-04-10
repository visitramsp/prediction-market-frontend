import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";
import { getErrorMessage } from "@/utils/Content";

export const getOrdersQuoteDetails = async (
  questionId: number,
  outcomeIndex: number,
  shares: number,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.ordersQuoteDetails}/?questionId=${questionId}&outcomeIndex=${outcomeIndex}&shares=${shares}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getQuoteByBudget = async (
  questionId: number,
  outcomeIndex: number,
  amount: number,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.quoteByBudget}/?questionId=${questionId}&outcomeIndex=${outcomeIndex}&budgetGross=${amount}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const submitOrder = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.submitOrder, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getGraphData = async (
  questionId: string | null,
  interval = "all",
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.graphData}/${questionId}/graph${
        interval && `?interval=${interval}`
      }`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const getCommonQuoteSell = async (
  questionId: number,
  outcomeIndex: number,
  amount: number,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.commonQuoteSell}/?questionId=${questionId}&outcomeIndex=${outcomeIndex}&shares=${amount}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getLeaderBoardMarket = async (questionId: string | null) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.leaderBoardMarketList}/${questionId}/?sort=profit`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getOrdersList = async (
  questionId: string | null,
  page: number = 1,
  limit: number = 5,
  status: string = "NEW",
  type: string = "LIMIT",
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.getOrders}/?questionId=${questionId}&status=${status}&type=${type}&limit=${limit}&page=${page}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const cancelOrder = async (questionId: number) => {
  try {
    const response = await apiInstance.post(
      `${API_URLs.cancelOrders}/${questionId}/cancel`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const getCurrentBalance = async () => {
  try {
    const response = await apiInstance.get(`${API_URLs.currentBalanceShares}`);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getCurrentShares = async (
  questionId: number,
  optionId: number,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.currentPositionShares}/?questionId=${questionId}&optionId=${optionId}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const submitOrdersTpAndSl = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.ordersTpAndSl, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
