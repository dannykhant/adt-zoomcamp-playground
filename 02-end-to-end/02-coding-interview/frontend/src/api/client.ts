export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * When `USE_MOCK_API` is true, all API helpers short‑circuit to in-browser
 * mock implementations instead of sending real HTTP requests.
 *
 * Flip this to `false` once your FastAPI backend is ready and listening on
 * `API_BASE_URL`.
 */
export const USE_MOCK_API = true;
