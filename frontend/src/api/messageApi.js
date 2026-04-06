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

/**
 * 🔥 NEW: Chat Media Upload karne ki API
 * file = image ya audio file ka object
 */
export const uploadChatMediaApi = async (file) => {
  const formData = new FormData();
  formData.append('media', file);

  const response = await api.post('/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};