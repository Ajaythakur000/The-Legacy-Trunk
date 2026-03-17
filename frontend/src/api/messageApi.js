import api from './axios';

/**
 * Chat history lane ke liye API
 * familyCircleId = jis vault ka chat chahiye
 * limit = kitne messages lane hain (default 50)
 */
export const getMessagesApi = async (familyCircleId, limit = 50) => {
  const response = await api.get(`/messages/${familyCircleId}?limit=${limit}`);
  return response.data;
};