// Datos de demostración del Centro de Supervisión de Casos (STASYS · SUSALUD).

export const kpiSummary = {
  registeredCases: 12452,
  criticalCases: 843,
  receivedReports: 3434,
  compliance: 8311,
};

export const casesByMonth = [
  { month: 'Ene', cases: 340 },
  { month: 'Feb', cases: 305 },
  { month: 'Mar', cases: 390 },
  { month: 'Abr', cases: 465 },
  { month: 'May', cases: 685 },
  { month: 'Jun', cases: 505 },
  { month: 'Jul', cases: 715 },
  { month: 'Ago', cases: 555 },
  { month: 'Sep', cases: 610 },
  { month: 'Oct', cases: 275 },
  { month: 'Nov', cases: 315 },
  { month: 'Dic', cases: 355 },
];

export const totalPriorityCases = 8462;

export const casesByPriority = [
  { key: 'critica', label: 'Crítica', value: 321, share: 3.8, color: '#ef4444' },
  { key: 'alta', label: 'Alta', value: 1324, share: 15.3, color: '#f97316' },
  { key: 'media', label: 'Media', value: 2896, share: 34.2, color: '#eab308' },
  { key: 'baja', label: 'Baja', value: 4121, share: 48.7, color: '#22c55e' },
];

export const casesByType = [
  { type: 'Atención por Salud', value: 4120 },
  { type: 'Cobertura', value: 3280 },
  { type: 'Reembolsos', value: 2460 },
  { type: 'Afiliación', value: 2140 },
  { type: 'Medicamentos', value: 1860 },
  { type: 'Otros', value: 1180 },
];

export const recentActivity = [
  {
    id: 'act-1',
    tone: 'info',
    title: 'Caso ST-2026-0909 actualizado',
    detail: 'Cambio de estado a En revisión',
  },
  {
    id: 'act-2',
    tone: 'success',
    title: 'Nuevo reporte recibido',
    detail: 'IPRESS Hospital Nacional del Sur',
  },
  {
    id: 'act-3',
    tone: 'warning',
    title: 'Caso ST-2026-0825 en revisión',
    detail: 'Prioridad alta · Cobertura',
  },
  {
    id: 'act-4',
    tone: 'muted',
    title: 'Reporte adjuntado',
    detail: 'Adjunto PDF · 2.4 MB',
  },
];

export const regionGoals = [
  { region: 'Lima Centro', meta: 2400, cerrados: 2160, cerradosPrev: 2040 },
  { region: 'Lima Norte', meta: 2000, cerrados: 1700, cerradosPrev: 1560 },
  { region: 'Lima Sur', meta: 1800, cerrados: 1260, cerradosPrev: 1440 },
  { region: 'Callao', meta: 1400, cerrados: 1190, cerradosPrev: 1092 },
  { region: 'Sierra Norte', meta: 1200, cerrados: 1056, cerradosPrev: 996 },
  { region: 'Sur y Selva', meta: 1100, cerrados: 945, cerradosPrev: 825 },
];

export const supervisedCases = [
  {
    code: 'ST-2026-0909',
    entity: 'Hospital Nacional del Sur',
    type: 'Cobertura',
    status: 'En revisión',
    date: '2026-10-11',
  },
  {
    code: 'ST-2026-0884',
    entity: 'EsSalud Lima Centro',
    type: 'Atención por Salud',
    status: 'Abierto',
    date: '2026-10-10',
  },
  {
    code: 'ST-2026-0825',
    entity: 'Clínica Regional Andina',
    type: 'Afiliación',
    status: 'En revisión',
    date: '2026-10-08',
  },
  {
    code: 'ST-2026-0791',
    entity: 'IPRESS Red Norte',
    type: 'Medicamentos',
    status: 'Cerrado',
    date: '2026-10-06',
  },
  {
    code: 'ST-2026-0740',
    entity: 'Hospital de Emergencias',
    type: 'Reembolsos',
    status: 'Crítico',
    date: '2026-10-04',
  },
];
