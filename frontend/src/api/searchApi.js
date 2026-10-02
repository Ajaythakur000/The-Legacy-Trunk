import api from './axios';

// Searches for content based on a query
export const searchContentApi = async (query) => {
  const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
  return response.data;
};