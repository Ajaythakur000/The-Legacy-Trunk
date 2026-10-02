import api from './axios';

// Creates a new story
export const createStoryApi = async (formData) => {
  const response = await api.post('/stories', formData);
  return response.data;
};

// Fetches the active feed for a circle
export const getCircleFeedApi = async (circleId) => {
  const response = await api.get(`/stories/feed?circleId=${circleId}`);
  return response.data;
};

// Gets stories from the user's family circles
export const getMyFamilyStoriesApi = async () => {
  const response = await api.get('/stories/my-family');
  return response.data;
};

// Fetches globally public stories
export const getGlobalStoriesApi = async () => {
  const response = await api.get('/stories/global');
  return response.data;
};

// Gets details of a specific story
export const getStoryByIdApi = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data;
};

// Updates an existing story
export const updateStoryApi = async (storyId, payload) => {
  const response = await api.put(`/stories/${storyId}`, payload);
  return response.data;
};

// Deletes a story
export const deleteStoryApi = async (storyId) => {
  const response = await api.delete(`/stories/${storyId}`);
  return response.data;
};

// Toggles the like status of a story
export const toggleLikeStoryApi = async (storyId) => {
  const response = await api.put(`/stories/${storyId}/like`);
  return response.data;
};

// Adds a comment to a story
export const addCommentToStoryApi = async (storyId, text) => {
  const response = await api.post(`/stories/${storyId}/comments`, { text });
  return response.data;
};

// Gets the current user's own stories
export const getMyStoriesApi = async () => {
  const response = await api.get('/stories/mine');
  return response.data;
};
