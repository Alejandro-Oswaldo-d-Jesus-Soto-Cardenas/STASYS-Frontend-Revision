import { AlertTriangle, CheckCircle2, FileText, Files } from 'lucide-react';
import useDashboard from '../hooks/useDashboard.js';
import KpiCard from '../components/KpiCard.jsx';
import CasesTrendChart from '../components/CasesTrendChart.jsx';
import PriorityDonut from '../components/PriorityDonut.jsx';
import CasesByType from '../components/CasesByType.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import CampaignPerformance from '../components/CampaignPerformance.jsx';
import DashboardState from '../components/DashboardState.jsx';

const statusClass = {
  Abierto: 'status-open',
  'En revisión': 'status-review',
  Cerrado: 'status-closed',
  Crítico: 'status-critical',
};

export default function DashboardPage() {
  const { status, data, error, retry } = useDashboard();
  if (status !== 'success') {
    return <div className="dashboard-page"><div className="page-heading"><h1>Centro de Supervisión de Casos</h1></div><DashboardState status={status} error={error} retry={retry} /></div>;
  }
  const {
    registeredCases,
    criticalCases,
    receivedReports,
    compliance,
    casesByMonth,
    casesByPriority,
    totalPriorityCases,
    casesByType,
    maxTypeValue,
    recentActivity,
    supervisedCases,
    regionGoals,
  } = data;

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <h1>Centro de Supervisión de Casos</h1>
        <p>Información en tiempo real para una supervisión más efectiva.</p>
      </div>

      <div className="dashboard-success" role="status"><CheckCircle2 size={18} aria-hidden="true" /> Datos cargados correctamente{import.meta.env.VITE_USE_MOCK_API !== 'false' ? ' · Datos de demostración' : ''}<button className="text-link" type="button" onClick={retry}>Actualizar</button></div>
      <section className="kpi-grid">
        <KpiCard
          label="Casos Registrados"
          value={registeredCases}
          icon={FileText}
          tone="red"
        />
        <KpiCard
          label="Casos Críticos"
          value={criticalCases}
          icon={AlertTriangle}
          tone="alert"
        />
        <KpiCard
          label="Reportes Recibidos"
          value={receivedReports}
          icon={Files}
          tone="green"
        />
        <KpiCard
          label="Cumplimiento"
          value={compliance}
          icon={CheckCircle2}
          tone="blue"
        />
      </section>

      <section className="content-grid">
        <CasesTrendChart data={casesByMonth} />
        <PriorityDonut data={casesByPriority} total={totalPriorityCases} />
      </section>

      <section className="content-grid secondary-grid">
        <CasesByType data={casesByType} maxValue={maxTypeValue} />
        <ActivityFeed items={recentActivity} />
      </section>

      <CampaignPerformance data={regionGoals} />

      <section className="panel orders-panel">
        <header className="panel-header">
          <h2>Últimos casos supervisados</h2>
          <button className="text-link" type="button">
            Ver todos
          </button>
        </header>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Entidad</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {supervisedCases.map((item) => (
              <tr key={item.code}>
                <td className="mono">{item.code}</td>
                <td>{item.entity}</td>
                <td>{item.type}</td>
                <td>
                  <span className={`status ${statusClass[item.status] ?? ''}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
