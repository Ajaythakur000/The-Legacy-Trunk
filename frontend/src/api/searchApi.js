import api from './axios';

export const searchContentApi = async (query) => {
  // Call the backend route you provided earlier
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};