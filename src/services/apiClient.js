const configuredApiUrl =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const normalizedApiUrl = configuredApiUrl
  .replace(
    /^(https?:\/\/)localhost(?=[:/]|$)/i,
    (_match, scheme) => `${scheme}127.0.0.1`
  )
  .replace(/\/+$/, "");

export const API_URL = import.meta.env.DEV ? "" : normalizedApiUrl;

export async function apiFetch(path, options) {
  try {
    return await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      const destination = API_URL || "the local Vite API proxy";
      throw new Error(
        `Cannot reach ${destination}. Make sure the backend is running and restart the frontend development server if needed.`,
        { cause: error }
      );
    }
    throw error;
  }
}
