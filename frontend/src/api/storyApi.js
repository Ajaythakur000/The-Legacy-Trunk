import api from './axios';

/**
 * Create Story (multipart/form-data)
 * formData fields:
 * - title (required)
 * - content (required)
 * - tags (optional, comma-separated)
 * - isGlobalPublic (optional, boolean/string)
 * - media (optional file)
 */
/**
 * Create Story (multipart/form-data)
 */
export const createStoryApi = async (formData) => {
  // ✅ Bas seedha formData pass kar de, Axios baaki khud sambhal lega
  const response = await api.post('/stories', formData);
  return response.data;
};
/**
 * Active Circle Feed
 */
export const getCircleFeedApi = async (circleId) => {
  // 🔥 Ab hum explicitly circleId bhej rahe hain backend ko
  const response = await api.get(`/stories/feed?circleId=${circleId}`);
  return response.data;
};

/**
 * My family stories (origin + shared)
 */
export const getMyFamilyStoriesApi = async () => {
  const response = await api.get('/stories/my-family');
  return response.data;
};

/**
 * Global public stories
 */
export const getGlobalStoriesApi = async () => {
  const response = await api.get('/stories/global');
  return response.data;
};

/**
 * Single story details
 */
export const getStoryByIdApi = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data;
};

/**
 * Update story
 */
export const updateStoryApi = async (storyId, payload) => {
  const response = await api.put(`/stories/${storyId}`, payload);
  return response.data;
};

/**
 * Delete story
 */
export const deleteStoryApi = async (storyId) => {
  const response = await api.delete(`/stories/${storyId}`);
  return response.data;
};

/**
 * Toggle like
 */
export const toggleLikeStoryApi = async (storyId) => {
  const response = await api.put(`/stories/${storyId}/like`);
  return response.data;
};

/**
 * Add comment
 */
export const addCommentToStoryApi = async (storyId, text) => {
  const response = await api.post(`/stories/${storyId}/comments`, { text });
  return response.data;
};