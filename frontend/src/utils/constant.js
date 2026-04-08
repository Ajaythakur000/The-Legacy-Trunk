// 🔥 FIX: Dynamically fetching backend URL. Defaults to localhost for development.
// Ensuring no trailing slash messes up the URL construction
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const USER_API_END_POINT = `${BASE_URL}/users`;
export const STORY_API_END_POINT = `${BASE_URL}/stories`;