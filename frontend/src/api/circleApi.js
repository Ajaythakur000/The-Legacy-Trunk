import api from './axios';

// Creates a new circle
export const createCircleApi = async ({ circleName }) => {
  const response = await api.post('/circles', { circleName });
  return response.data;
};

// Fetches the circles the user belongs to
export const getMyCirclesApi = async () => {
  const response = await api.get('/circles');
  return response.data;
};

// Gets details for a specific circle
export const getCircleByIdApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}`);
  return response.data;
};

// Sends a family invite email
export const sendFamilyInviteApi = async (circleId, { email }) => {
  const response = await api.post(`/circles/${circleId}/members`, { email });
  return response.data;
};

// Removes a member from a circle
export const removeMemberFromCircleApi = async (circleId, memberId) => {
  const response = await api.delete(`/circles/${circleId}/members/${memberId}`);
  return response.data;
};

// Deletes a family circle
export const deleteCircleApi = async (circleId) => {
  const response = await api.delete(`/circles/${circleId}`);
  return response.data;
};

// Gets the top 10 families by bond points
export const getLeaderboardApi = async () => {
  const response = await api.get('/circles/leaderboard');
  return response.data;
};

// Fetches upcoming events for a circle
export const getUpcomingEventsApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}/upcoming-events`);
  return response.data;
};

// Gets the top contributor for a circle
export const getTopContributorApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}/top-contributor`);
  return response.data;
};

// Generates a magic invite link for a circle
export const generateInviteLinkApi = async (circleId) => {
  const response = await api.post(`/circles/${circleId}/invite-link`);
  return response.data;
};

// Joins a family circle using an invite token
export const joinViaInviteApi = async (token) => {
  const response = await api.post('/circles/join-invite', { token });
  return response.data;
};