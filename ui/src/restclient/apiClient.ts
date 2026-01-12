import APIClient, { getApiBaseUrl, getAuthBaseUrl } from "./apiInstance";

/**
 * Instancia compartida para el API principal (ponti-api)
 * Detecta automáticamente la URL según el ambiente (dev/prod/local)
 */
const apiClient = new APIClient({
  timeout: 30000,
  baseURL: getApiBaseUrl(),
});

/**
 * Instancia separada para el API de autenticación (auth-api)
 * Usa VITE_AUTH_API_URL o fallback al API principal
 */
const authClient = new APIClient({
  timeout: 30000,
  baseURL: getAuthBaseUrl(),
});

export default apiClient;
export { authClient };
