import api from './axios';

// Gets the current user's location
export const getMyLocationApi = async () => {
  const response = await api.get('/location/me');
  return response.data;
};

// Fetches the family radar data
export const getFamilyRadarApi = async () => {
  const response = await api.get('/location/family-radar');
  return response.data;
};

// Toggles ghost mode on or off
export const toggleGhostModeApi = async (isGhostModeOn) => {
  const response = await api.put('/location/ghost-mode', { isGhostModeOn });
  return response.data;
};

// Updates the user's live location
export const updateMyLocationApi = async ({ latitude, longitude }) => {
  const response = await api.put('/location/update', { latitude, longitude });
  return response.data;
};