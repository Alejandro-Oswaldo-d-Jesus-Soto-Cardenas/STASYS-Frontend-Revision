import { dashboardMock } from "./dashboard.mock";
import { DASHBOARD_ENDPOINTS } from "./dashboard.endpoints";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function get(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status} al consultar ${endpoint}`
    );
  }

  return response.json();
}

async function request(endpoint, mockData) {
  if (USE_MOCK_API) {
    // Simulación temporal: no se realiza ninguna petición HTTP.
    return structuredClone(mockData);
  }

  return get(endpoint);
}

export const dashboardApi = {
  getKpis: () =>
    request(DASHBOARD_ENDPOINTS.kpis, dashboardMock.kpis),

  getSolicitudesPorTipo: () =>
    request(
      DASHBOARD_ENDPOINTS.solicitudesPorTipo,
      dashboardMock.solicitudesPorTipo
    ),

  getSolicitudesPorInstitucion: () =>
    request(
      DASHBOARD_ENDPOINTS.solicitudesPorInstitucion,
      dashboardMock.solicitudesPorInstitucion
    ),

  getTendenciaMensual: () =>
    request(
      DASHBOARD_ENDPOINTS.tendenciaMensual,
      dashboardMock.tendenciaMensual
    ),

  getSolicitudesPorUbicacion: () =>
    request(
      DASHBOARD_ENDPOINTS.solicitudesPorUbicacion,
      dashboardMock.solicitudesPorUbicacion
    ),

  getMetadata: () =>
    request(DASHBOARD_ENDPOINTS.metadata, dashboardMock.metadata),
};