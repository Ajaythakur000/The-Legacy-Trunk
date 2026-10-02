import api from './axios';

// Fetches chat history for a family circle
export const getMessagesApi = async (familyCircleId, limit = 50) => {
  const response = await api.get(`/messages/${familyCircleId}?limit=${limit}`);
  return response.data;
};

// Uploads media for a chat message
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