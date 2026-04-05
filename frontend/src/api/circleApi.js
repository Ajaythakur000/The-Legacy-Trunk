import api from './axios';

/**
 * Create new circle
 * body: { circleName }
 */
export const createCircleApi = async ({ circleName }) => {
  const response = await api.post('/circles', { circleName });
  return response.data;
};

/**
 * Get all circles where logged-in user is member
 */
export const getMyCirclesApi = async () => {
  const response = await api.get('/circles');
  return response.data;
};

/**
 * Get one circle details by ID
 */
export const getCircleByIdApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}`);
  return response.data;
};

/**
 * Add member by email
 * body: { email }
 */
export const addMemberToCircleApi = async (circleId, { email }) => {
  const response = await api.post(`/circles/${circleId}/members`, { email });
  return response.data;
};

/**
 * Remove member by memberId
 */
export const removeMemberFromCircleApi = async (circleId, memberId) => {
  const response = await api.delete(`/circles/${circleId}/members/${memberId}`);
  return response.data;
};

// ==========================================
// 🏆 THE LEADERBOARD API
// ==========================================
/**
 * Fetch Top 10 Families by Bond Points
 */
export const getLeaderboardApi = async () => {
  const response = await api.get('/circles/leaderboard');
  return response.data;
};

// ==========================================
// 🌟 DASHBOARD WIDGETS API
// ==========================================

/**
 * Fetch Upcoming Events (Birthdays & Milestones)
 */
export const getUpcomingEventsApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}/upcoming-events`);
  return response.data;
};

/**
 * Fetch Top Contributor (Champion) for a specific circle
 */
export const getTopContributorApi = async (circleId) => {
  const response = await api.get(`/circles/${circleId}/top-contributor`);
  return response.data;
};

// ==========================================
// 🪄 MAGIC INVITE API
// ==========================================

/**
 * Generate Magic Invite Link (Admin Only)
 */
export const generateInviteLinkApi = async (circleId) => {
  const response = await api.post(`/circles/${circleId}/invite-link`);
  return response.data;
};

/**
 * Join Family via Magic Invite Token
 * body: { token }
 */
export const joinViaInviteApi = async (token) => {
  const response = await api.post('/circles/join-invite', { token });
  return response.data;
};