import api from './axios';

/**
 * Logged-in user ki current location details lane ke liye
 */
export const getMyLocationApi = async () => {
  const response = await api.get('/location/me');
  return response.data;
};

/**
 * Same family ke members ka radar data lane ke liye
 */
export const getFamilyRadarApi = async () => {
  const response = await api.get('/location/family-radar');
  return response.data;
};

/**
 * Ghost mode ON/OFF karne ke liye
 * input: true or false
 */
export const toggleGhostModeApi = async (isGhostModeOn) => {
  const response = await api.put('/location/ghost-mode', { isGhostModeOn });
  return response.data;
};

/**
 * User ki live location update karne ke liye
 */
export const updateMyLocationApi = async ({ latitude, longitude }) => {
  const response = await api.put('/location/update', { latitude, longitude });
  return response.data;
};