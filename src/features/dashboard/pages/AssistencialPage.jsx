
import { useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  MapPin,
  Users,
  Search,
  RotateCcw,
  Printer,
  TrendingUp,
  ChevronDown,
  Database,
} from 'lucide-react';

import {
  goldDashboardData,
  formatNumber,
} from '../data/goldDashboardData.js';

function MetricCard({ title, value, description, icon: Icon, accent }) {
  return (
    <article className="production-metric">
      <div className={`production-metric-icon ${accent}`}>
        <Icon size={21} />
      </div>
      <div className="production-metric-content">
        <span>{title}</span>
        <strong>{formatNumber(value)}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}

function AssistencialPage() {
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('atenciones');
  const [sortDirection, setSortDirection] = useState('desc');

  const production = goldDashboardData.produccion;
  const departments = production.porDepartamento;

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-PE');

    return departments
      .filter((item) => {
        const matchesDepartment =
          !department || item.nombre === department;

        const matchesSearch =
          !query || item.nombre.toLocaleLowerCase('es-PE').includes(query);

        return matchesDepartment && matchesSearch;
      })
      .sort((a, b) => {
        const comparison = sortBy === 'nombre'
          ? a.nombre.localeCompare(b.nombre, 'es')
          : a[sortBy] - b[sortBy];

        return sortDirection === 'desc' ? -comparison : comparison;
      });
  }, [departments, department, search, sortBy, sortDirection]);

  const topDepartment = [...departments].sort(
    (a, b) => b.atenciones - a.atenciones,
  )[0];

  const share = (value) =>
    production.atenciones > 0
      ? (value / production.atenciones) * 100
      : 0;

  function clearFilters() {
    setDepartment('');
    setSearch('');
    setSortBy('atenciones');
    setSortDirection('desc');
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDirection((current) => current === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection(field === 'nombre' ? 'asc' : 'desc');
    }
  }

  return (
    <div className="assistencial-page production-page">
      <header className="production-heading">
        <div>
          <span className="production-eyebrow">
            STASYS / ANÁLISIS ASISTENCIAL
          </span>
          <h1>Producción Asistencial</h1>
          <p>
            Analiza las atenciones y personas atendidas por departamento,
            con información procesada del año {production.anio}.
          </p>
        </div>

        <div className="production-year">
          <span>PERIODO ANALIZADO</span>
          <strong>{production.anio}</strong>
          <small>Datos históricos GOLD</small>
        </div>
      </header>

      <section className="production-metrics" aria-label="Indicadores de producción">
        <MetricCard
          title="Atenciones registradas"
          value={production.atenciones}
          description="Total nacional · 2015"
          icon={Activity}
          accent="blue"
        />
        <MetricCard
          title="Personas atendidas"
          value={production.atendidos}
          description="Total nacional · 2015"
          icon={Users}
          accent="violet"
        />
        <MetricCard
          title="Departamentos"
          value={departments.length}
          description="Con registros disponibles"
          icon={MapPin}
          accent="teal"
        />
        <MetricCard
          title="IPRESS registradas"
          value={goldDashboardData.ipress.total}
          description="Según RENIPRESS procesado"
          icon={Building2}
          accent="amber"
        />
      </section>

      <section className="production-highlight">
        <div className="production-highlight-icon">
          <TrendingUp size={23} />
        </div>
        <div className="production-highlight-main">
          <span>DEPARTAMENTO CON MAYOR PRODUCCIÓN</span>
          <h2>{topDepartment.nombre}</h2>
          <p>
            {formatNumber(topDepartment.atenciones)} atenciones registradas
            durante {production.anio}.
          </p>
        </div>
        <div className="production-highlight-share">
          <strong>{share(topDepartment.atenciones).toLocaleString('es-PE', {
            maximumFractionDigits: 2,
          })}%</strong>
          <span>del total nacional</span>
        </div>
      </section>

      <section className="production-table-panel">
        <div className="production-panel-heading">
          <div>
            <h2>Detalle por departamento</h2>
            <p>
              Distribución de atenciones y personas atendidas.
            </p>
          </div>
          <span className="production-record-count">
            {filteredDepartments.length} de {departments.length} departamentos
          </span>
        </div>

        <div className="production-filters">
          <label className="production-filter">
            <span>Departamento</span>
            <div className="production-select-wrap">
              <MapPin size={17} />
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option value="">Todos los departamentos</option>
                {departments.map((item) => (
                  <option key={item.nombre} value={item.nombre}>
                    {item.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </label>

          <label className="production-filter production-search">
            <span>Buscar</span>
            <div className="production-search-wrap">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre del departamento..."
              />
            </div>
          </label>

          <button
            className="production-action-button"
            type="button"
            onClick={clearFilters}
          >
            <RotateCcw size={16} />
            Limpiar
          </button>

          <button
            className="production-action-button production-print-button"
            type="button"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimir
          </button>
        </div>

        <div className="production-table-scroll">
          <table className="production-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => toggleSort('nombre')}>
                    Departamento
                    <ChevronDown size={14} />
                  </button>
                </th>
                <th className="production-number-column">
                  <button type="button" onClick={() => toggleSort('atenciones')}>
                    Atenciones
                    <ChevronDown size={14} />
                  </button>
                </th>
                <th className="production-number-column">
                  <button type="button" onClick={() => toggleSort('atendidos')}>
                    Personas atendidas
                    <ChevronDown size={14} />
                  </button>
                </th>
                <th className="production-distribution-column">
                  Participación nacional
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((item, index) => {
                const percentage = share(item.atenciones);

                return (
                  <tr key={item.nombre}>
                    <td>
                      <div className="production-department-cell">
                        <span className="production-row-index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <strong>{item.nombre}</strong>
                        {item.nombre === topDepartment.nombre && (
                          <span className="production-leader-tag">Mayor</span>
                        )}
                      </div>
                    </td>

                    <td className="production-number">
                      {formatNumber(item.atenciones)}
                    </td>

                    <td className="production-number production-secondary-number">
                      {formatNumber(item.atendidos)}
                    </td>

                    <td>
                      <div className="production-share-cell">
                        <div className="production-share-track">
                          <div
                            className={`production-share-fill ${
                              item.nombre === topDepartment.nombre
                                ? 'production-share-fill-top'
                                : ''
                            }`}
                            style={{
                              width: `${Math.max(
                                percentage > 0 ? 1 : 0,
                                percentage / share(topDepartment.atenciones) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span>
                          {percentage.toLocaleString('es-PE', {
                            maximumFractionDigits: 2,
                          })}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan={4} className="production-empty">
                    No se encontraron departamentos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>

            {filteredDepartments.length > 0 && (
              <tfoot>
                <tr>
                  <td>Resultados mostrados</td>
                  <td className="production-number">
                    {formatNumber(
                      filteredDepartments.reduce(
                        (sum, item) => sum + item.atenciones,
                        0,
                      ),
                    )}
                  </td>
                  <td className="production-number">
                    {formatNumber(
                      filteredDepartments.reduce(
                        (sum, item) => sum + item.atendidos,
                        0,
                      ),
                    )}
                  </td>
                  <td>
                    {share(
                      filteredDepartments.reduce(
                        (sum, item) => sum + item.atenciones,
                        0,
                      ),
                    ).toLocaleString('es-PE', {
                      maximumFractionDigits: 2,
                    })}% del total nacional
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="production-table-footer">
          <span>
            <Database size={15} />
            Fuente: GOLD · Producción asistencial C1
          </span>
          <span>Periodo: {production.anio} · Valores históricos</span>
        </div>
      </section>

      <footer className="assistencial-footer production-footer">
        STASYS · Producción asistencial · Información procesada
      </footer>
    </div>
  );
}

export default AssistencialPage;
