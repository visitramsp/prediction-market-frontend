import { getErrorMessage } from "@/utils/Content";
import apiInstance from "../apiInstance";
import { API_URLs } from "../apiURLs";

// Get reels feed (paginated)
export const getReelsFeed = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.reelsFeed}?page=${page}&limit=${limit}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Create a new reel (upload video)
export const createReel = async (formData: FormData) => {
  try {
    const response = await apiInstance.post(API_URLs.reelCreate, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get single reel by id
export const getReelById = async (reelId: number) => {
  try {
    const response = await apiInstance.get(`${API_URLs.reelById}/${reelId}`);
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get reels linked to a prediction question
export const getReelsByQuestion = async (
  questionId: number,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.reelsByQuestion}/${questionId}?page=${page}&limit=${limit}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get reels by user
export const getReelsByUser = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.reelsByUser}/${userId}?page=${page}&limit=${limit}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Delete a reel
export const deleteReel = async (reelId: number) => {
  try {
    const response = await apiInstance.delete(
      `${API_URLs.reelDelete}/${reelId}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Like / Unlike a reel
export const toggleReelLike = async (reelId: number) => {
  try {
    const response = await apiInstance.post(
      `${API_URLs.reelLike}/${reelId}/like`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Bookmark / Un-bookmark a reel
export const toggleReelBookmark = async (reelId: number) => {
  try {
    const response = await apiInstance.post(
      `${API_URLs.reelBookmark}/${reelId}/bookmark`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get comments for a reel
export const getReelComments = async (
  reelId: number,
  page: number = 1,
  limit: number = 20,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.reelComments}/${reelId}/comments?page=${page}&limit=${limit}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Add a comment to a reel
export const addReelComment = async (
  reelId: number,
  content: string,
  parentId?: number,
) => {
  try {
    const response = await apiInstance.post(
      `${API_URLs.reelComments}/${reelId}/comments`,
      { content, parentId },
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Delete a comment
export const deleteReelComment = async (commentId: number) => {
  try {
    const response = await apiInstance.delete(
      `${API_URLs.reelCommentDelete}/${commentId}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Record a view
export const recordReelView = async (
  reelId: number,
  watchDuration?: number,
) => {
  try {
    const response = await apiInstance.post(
      `${API_URLs.reelView}/${reelId}/view`,
      { watchDuration },
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};

// Get bookmarked reels
export const getBookmarkedReels = async (
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const response = await apiInstance.get(
      `${API_URLs.reelBookmarks}?page=${page}&limit=${limit}`,
    );
    return response?.data;
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
};
