import * as local from '../data/casesData.js';

export function validateDashboard(data) {
  if (data == null || (Array.isArray(data) && data.length === 0)) return null;
  const lists = ['casesByMonth', 'casesByPriority', 'casesByType', 'recentActivity', 'supervisedCases', 'regionGoals'];
  const metrics = ['registeredCases', 'criticalCases', 'receivedReports', 'compliance', 'totalPriorityCases'];
  if (!lists.every((key) => Array.isArray(data[key])) || !metrics.every((key) => Number.isFinite(data[key]) && data[key] >= 0)) {
    throw new Error('La respuesta del servidor no tiene el formato esperado.');
  }
  if (data.registeredCases === 0 && lists.every((key) => data[key].length === 0)) return null;
  return { ...data, maxTypeValue: Math.max(...data.casesByType.map((item) => item.value), 1) };
}

export async function loadDashboard(signal) {
  if (import.meta.env.VITE_USE_MOCK_API !== 'false') {
    const scenario = new URLSearchParams(window.location.search).get('estado');
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, scenario === 'carga' ? 10000 : 700);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Solicitud cancelada', 'AbortError'));
      }, { once: true });
    });
    signal.throwIfAborted();
    if (scenario === 'error') throw new Error('No se pudo conectar con el servicio de datos de demostración.');
    if (scenario === 'vacio') return null;
    return validateDashboard(structuredClone({ ...local, ...local.kpiSummary }));
  }
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
  // Contrato agregado propuesto; requiere implementación en el backend.
  const response = await fetch(`${base}/api/v1/dashboard`, { signal });
  if (!response.ok) throw new Error(`No se pudieron cargar los datos (HTTP ${response.status}).`);
  if (response.status === 204) return null;
  return validateDashboard(await response.json());
}
