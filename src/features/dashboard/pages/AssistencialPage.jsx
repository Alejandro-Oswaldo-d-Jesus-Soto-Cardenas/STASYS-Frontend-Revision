import { useMemo, useState } from 'react';
import { Building2, HeartPulse, Hospital, Stethoscope } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber.jsx';

const alerts = [
  {
    code: 'ALT-001',
    entity: 'IPRESS',
    socialReason: 'SANNA - CLINICA BELEN',
    department: 'Lima',
    quantity: 90,
    attentions: 90,
    attended: 90,
    date: '2026-10-24',
    level: 'Alto',
  },
  {
    code: 'ALT-002',
    entity: 'SUSALUD',
    socialReason: 'HOSPITAL REGIONAL DE LORETO "FELIPE SANTIAGO ARRIOLA IGLESIAS"',
    department: 'Loreto',
    quantity: 40,
    attentions: 56,
    attended: 50,
    date: '2026-10-23',
    level: 'Medio',
  },
  {
    code: 'ALT-003',
    entity: 'RENIPRESS',
    socialReason: 'HOSPITAL REGIONAL DOCENTE CLINICO QUIRURGICO DANIEL ALCIDES CARRION DE HUANCAYO',
    department: 'Junín',
    quantity: 30,
    attentions: 35,
    attended: 35,
    date: '2026-10-22',
    level: 'Alto',
  },
];

const metrics = [
  { label: 'IPRESS', value: 5600, icon: Building2 },
  { label: 'SUSALUD', value: 4800, icon: Stethoscope },
  { label: 'RENIPRESS', value: 3000, icon: Hospital },
  { label: 'Total Atenciones', value: 14000, icon: HeartPulse },
];

const filterOptions = {
  department: ['Lima', 'Loreto', 'Junín'],
  entity: ['IPRESS', 'SUSALUD', 'RENIPRESS'],
};

const initialFilters = {
  department: '',
  entity: '',
  socialReason: '',
  level: '',
  date: '',
};

const number = new Intl.NumberFormat('es-PE');
const dateFormat = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function AssistencialPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [selectedCode, setSelectedCode] = useState(alerts[0].code);
  const [reportMessage, setReportMessage] = useState('');

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) =>
        (!appliedFilters.department || alert.department === appliedFilters.department)
        && (!appliedFilters.entity || alert.entity === appliedFilters.entity)
        && (!appliedFilters.socialReason
          || alert.socialReason.toLocaleLowerCase('es-PE').includes(appliedFilters.socialReason.toLocaleLowerCase('es-PE')))
        && (!appliedFilters.level || alert.level === appliedFilters.level)
        && (!appliedFilters.date || alert.date === appliedFilters.date),
      ),
    [appliedFilters],
  );

  const selectedAlert = filteredAlerts.find((alert) => alert.code === selectedCode) ?? filteredAlerts[0];

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setAppliedFilters(filters);
    setSelectedCode('');
    setReportMessage('');
  }

  function clearFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setSelectedCode(alerts[0].code);
    setReportMessage('');
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="assistencial-page">
      <header className="assistencial-heading">
        <h1>Producción Asistencial en Emergencia.</h1>
        <p>Monitoreo de atenciones médicas de Emergencias para cada IPRESS</p>
      </header>

      <section className="assistencial-metrics" aria-label="Resumen de atenciones">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article className="assistencial-metric" key={label}>
            <span className="assistencial-metric-icon" aria-hidden="true"><Icon size={21} /></span>
            <div>
              <h2>{label}</h2>
              <p><AnimatedNumber key={value} value={value} /></p>
            </div>
          </article>
        ))}
      </section>

      <section className="assistencial-panel assistencial-filters-panel">
        <h2>Filtros de búsqueda</h2>
        <form className="assistencial-filters" onSubmit={applyFilters}>
          <label>
            Departamento
            <select name="department" value={filters.department} onChange={updateFilter}>
              <option value="">Todos</option>
              {filterOptions.department.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Entidad
            <select name="entity" value={filters.entity} onChange={updateFilter}>
              <option value="">Todas</option>
              {filterOptions.entity.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Razón social
            <select name="socialReason" value={filters.socialReason} onChange={updateFilter}>
              <option value="">Todas</option>
              {alerts.map((alert) => <option key={alert.code} value={alert.socialReason}>{alert.socialReason}</option>)}
            </select>
          </label>
          <label>
            Nivel de atención
            <select name="level" value={filters.level} onChange={updateFilter}>
              <option value="">Todos</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
            </select>
          </label>
          <label>
            Fecha
            <select name="date" value={filters.date} onChange={updateFilter}>
              <option value="">Todas</option>
              {alerts.map((alert) => (
                <option key={alert.date} value={alert.date}>{dateFormat.format(new Date(`${alert.date}T12:00:00`))}</option>
              ))}
            </select>
          </label>
          <div className="assistencial-filter-actions">
            <button className="assistencial-button assistencial-button-primary" type="submit">Buscar</button>
            <button className="assistencial-button" type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        </form>
      </section>

      <section className="assistencial-panel">
        <h2>Listado de alertas</h2>
        <div className="assistencial-table-wrap">
          <table className="assistencial-table">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Entidad</th>
                <th scope="col">Razón social</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Atenciones</th>
                <th scope="col">Atendidos</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr className={selectedAlert?.code === alert.code ? 'selected' : ''} key={alert.code}>
                  <td>{alert.code}</td>
                  <td>{alert.entity}</td>
                  <td>{alert.socialReason}</td>
                  <td className="assistencial-number">{number.format(alert.quantity)}</td>
                  <td className="assistencial-number">{number.format(alert.attentions)}</td>
                  <td className="assistencial-number">{number.format(alert.attended)}</td>
                  <td>
                    <button
                      className="assistencial-button assistencial-detail-button"
                      type="button"
                      onClick={() => {
                        setSelectedCode(alert.code);
                        setReportMessage('');
                      }}
                      aria-label={`Ver detalle de ${alert.code}`}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td className="assistencial-empty" colSpan="7">No se encontraron alertas con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedAlert && (
        <section className="assistencial-panel assistencial-detail">
          <h2>Detalle de la Asistencia Médica</h2>
          <div className="assistencial-detail-content">
            <div className="assistencial-detail-id">
              <strong>{selectedAlert.code}</strong>
              <span>{selectedAlert.entity}</span>
            </div>
            <dl className="assistencial-detail-fields">
              <div><dt>Razón social:</dt><dd>{selectedAlert.socialReason}</dd></div>
              <div><dt>Total de atenciones:</dt><dd>{number.format(selectedAlert.attentions)}</dd></div>
              <div><dt>Nivel de atención:</dt><dd><span className={`assistencial-level level-${selectedAlert.level.toLocaleLowerCase('es-PE')}`}>{selectedAlert.level}</span></dd></div>
            </dl>
            <div className="assistencial-detail-actions">
              <button className="assistencial-button" type="button" onClick={printReport}>Generar PDF General</button>
              <button
                className="assistencial-button assistencial-button-primary"
                type="button"
                onClick={() => setReportMessage('La generación de reportes con IA todavía no está conectada. Puedes imprimir o guardar esta vista como PDF.')}
              >
                Generar Reporte Con IA
              </button>
              {reportMessage && <p className="assistencial-report-message" role="status">{reportMessage}</p>}
            </div>
          </div>
        </section>
      )}

      <footer className="assistencial-footer">STASYS | Sistema de Monitoreo y Análisis</footer>
    </div>
  );
}

export default AssistencialPage;
