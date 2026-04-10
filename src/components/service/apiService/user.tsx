import { getErrorMessage } from "@/utils/Content";
import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";

export const userBalance = async () => {
  try {
    const response = await apiInstance.get(API_URLs.userBalance);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiInstance.post(API_URLs.logout);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const userDetails = async () => {
  try {
    const response = await apiInstance.get(API_URLs.userDetails);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const userPositions = async () => {
  try {
    const response = await apiInstance.get(API_URLs.userPositions);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const getFeed = async (questionId: string, limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.getFeed}${`?limit=${limit}&offset=${offset}${questionId ? `&questionId=${questionId}` : ""}`}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const getFeedForFollowingList = async (limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.feedForFollowingList}?limit=${limit}&offset=${offset}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const imageUpload = async (images: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.imageUpload, images, {
      headers: {
        "Content-Type": "multipart/form-data",
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

export const postProfileUpdate = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.profileUpdate, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const userPost = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.userPost, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const postLikeOrUnlike = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.likeOrUnlike, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const postBookmarkOrUnBookMark = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(
      API_URLs.bookmarkOrUnBookMark,
      reqBody,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getBookMarkList = async (id: string) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.bookMarkList}${id ? `?userId=${id}` : ""}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getCommentsList = async (id: number) => {
  try {
    const response = await apiInstance.get(`${API_URLs.getComments}/${id}`);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const replyComments = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.postComments, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const getUsersAllDetails = async (
  id: string,
  limit = 10,
  offset = 0,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.getProfileListAllUser}?limit=${limit}&offset=${offset}${id ? `&targetId=${id}` : ""}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const postQuestionBookUnBookMark = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.questionBookMark, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const fetchWatchList = async (offset = 0, limit = 30) => {
  try {
    const response = await apiInstance.get(API_URLs.getWatchList, {
      params: {
        offset,
        limit,
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

export const postFollowUser = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.followUser, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const postUnFollowUser = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.unFollowUser, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const postUserCommentLikeOrUnlike = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(
      API_URLs.userCommentLikeOrUnlike,
      reqBody,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const fetchNotification = async (limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.getNotification}?limit=${limit}&offset=${offset}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};
export const fetchUnReadCountNotification = async () => {
  try {
    const response = await apiInstance.get(API_URLs.getUnReadCountNotification);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const postReadNotification = async (reqBody: unknown) => {
  try {
    const response = await apiInstance.post(API_URLs.readNotification, reqBody);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const postAllReadNotification = async () => {
  try {
    const response = await apiInstance.post(API_URLs.allReadNotification);
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getMyAllPost = async (id: string, limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.myAllPost}?limit=${limit}&offset=${offset}${id ? `&questionId=${id}` : ""}`, ////${true ? `?username=${"unknown"}` : ""}
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getUserSearch = async (search = "", limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.userSearch}${search ? `?search=${search}` : ""}${limit ? `&limit=${limit}` : ""}${offset ? `&offset=${offset}` : ""}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getFeedDetailsById = async (id = 1) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.feedDetailsById}${id ? `?postId=${id}` : ""}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getFollowers = async (userId = 1, limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.follow}/${userId}/followers?limit=${limit}&offset=${offset}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

export const getFollowing = async (userId = 1, limit = 10, offset = 0) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.follow}/${userId}/following?limit=${limit}&offset=${offset}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
};

// logout
