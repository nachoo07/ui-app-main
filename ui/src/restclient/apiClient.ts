import APIClient from "./apiInstance";

/**
 * Instancia compartida de APIClient que detecta automáticamente
 * las URLs de las APIs según el ambiente (dev/prod/local)
 * 
 * NO pases baseURL al instanciar para que use las variables de entorno
 */
const apiClient = new APIClient({
  timeout: 30000,
  // baseURL se detecta automáticamente desde getApiBaseUrl()
});

export default apiClient;
