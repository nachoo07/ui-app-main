import APIClient from "./apiInstance";

// Cliente para autenticación (apunta a auth-api)
export const authClient = new APIClient({
  timeout: 15000,
  baseURL: "/auth",
});

// Cliente para API general
export const apiClient = new APIClient({
  timeout: 15000,
  baseURL: "/api",
});
