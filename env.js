// API address of the app.
// - Local development: EXPO_PUBLIC_API_URL from .env (Expo inlines EXPO_PUBLIC_*
//   variables at build time), otherwise the API on this machine.
// - Docker web image: built without the variable, so the bundle keeps the
//   placeholder below; inject-env.sh replaces it when the container starts,
//   which lets one image serve any environment.
const PLACEHOLDER = "EXPO_PUBLIC_API_URL_PLACEHOLDER";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? "http://localhost:3000/api" : PLACEHOLDER);

export default { API_URL };
