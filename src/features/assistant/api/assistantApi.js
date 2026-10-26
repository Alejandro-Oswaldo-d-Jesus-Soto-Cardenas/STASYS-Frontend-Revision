import {
  casesByPriority,
  kpiSummary,
  supervisedCases,
  totalPriorityCases,
} from '../../dashboard/data/casesData.js';

const format = new Intl.NumberFormat('es-PE');

function buildSimulatedAnswer(question) {
  const normalizedQuestion = question.toLocaleLowerCase('es-PE');
  const pendingCases = supervisedCases.filter((item) =>
    ['Abierto', 'En revisión'].includes(item.status),
  ).length;

  if (/cr[ií]tic|riesgo|alerta|prioridad/.test(normalizedQuestion)) {
    const criticalPriority = casesByPriority.find((item) => item.key === 'critica');
    return `En el dashboard de demostración se muestran ${format.format(kpiSummary.criticalCases)} casos críticos. La distribución ilustrativa por prioridad incluye ${format.format(criticalPriority?.value ?? 0)} casos de prioridad crítica y ${format.format(casesByPriority.find((item) => item.key === 'alta')?.value ?? 0)} de prioridad alta. Estos datos son estáticos y no representan alertas consultadas en tiempo real.`;
  }

  if (/ipress|establecimiento|hospital|cl[ií]nica|entidad/.test(normalizedQuestion)) {
    const establishments = [...new Set(supervisedCases.map((item) => item.entity))];
    return `La tabla demostrativa de casos supervisados menciona ${establishments.join(', ')}. Esta vista no consulta un padrón de IPRESS ni verifica información actualizada de establecimientos.`;
  }

  if (/denuncia|seguimiento|seguimiento|caso|pendiente|abiert|revisi/.test(normalizedQuestion)) {
    const examples = supervisedCases
      .slice(0, 3)
      .map((item) => `${item.code} (${item.status})`)
      .join(', ');
    return `El dashboard de demostración registra ${format.format(kpiSummary.registeredCases)} casos en su indicador general. En los ${supervisedCases.length} registros de ejemplo visibles, ${pendingCases} figuran como abiertos o en revisión. Algunos ejemplos son: ${examples}. No se consultó un sistema real de denuncias ni el estado actual de los casos.`;
  }

  if (/indicador|gr[aá]fic|dashboard|reporte|registrad/.test(normalizedQuestion)) {
    return `Los indicadores estáticos del dashboard muestran ${format.format(kpiSummary.registeredCases)} casos registrados, ${format.format(kpiSummary.criticalCases)} casos críticos, ${format.format(kpiSummary.receivedReports)} reportes recibidos y un valor de cumplimiento de ${format.format(kpiSummary.compliance)}. El gráfico de prioridad presenta ${format.format(totalPriorityCases)} casos distribuidos entre cuatro niveles. Son datos de demostración, no una consulta en tiempo real.`;
  }

  return 'Puedo orientarte sobre los casos registrados o pendientes, las alertas y niveles de riesgo, las IPRESS de ejemplo, los indicadores del dashboard y el seguimiento de casos. Mis respuestas son simuladas y utilizan únicamente los datos de demostración incluidos en STASYS; no consulto información en tiempo real.';
}

/** Procesa una pregunta. El adaptador puede sustituirse por un servicio real cuando exista. */
export async function processAssistantQuestion(question) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) {
    throw new Error('Escribe una pregunta antes de enviarla.');
  }

  // No hay una API de IA configurada: simulamos latencia y respuesta local.
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  return {
    content: buildSimulatedAnswer(cleanQuestion),
    simulated: true,
  };
}
