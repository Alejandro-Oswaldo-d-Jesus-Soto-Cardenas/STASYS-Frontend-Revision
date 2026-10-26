
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  MapPin,
  RefreshCw,
  Search,
  AlertTriangle,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react';

import renipressUrl from '../../../assets/datasets-sinProcesar/RENIPRESS_2026_v6.csv?url';

const PAGE_SIZE = 10;
const numberFormat = new Intl.NumberFormat('es-PE');

const REQUIRED_FIELDS = [
  'COD_IPRESS',
  'NOMBRE',
  'INSTITUCION',
  'CLASIFICACION',
  'CATEGORIA',
  'DEPARTAMENTO',
  'PROVINCIA',
  'DISTRITO',
  'ESTADO',
];

function formatNumber(value) {
  return numberFormat.format(value);
}

function cleanValue(value) {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim();
}

/**
 * Parser CSV compatible con:
 * - Separador punto y coma
 * - Campos entre comillas
 * - Comillas escapadas como ""
 * - Saltos de línea dentro de campos entre comillas
 */
function parseCsv(text, delimiter = ';') {
  const rows = [];
  let row = [];
  let field = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;

      row.push(field);
      field = '';

      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }

      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);

    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }
  }

  if (insideQuotes) {
    throw new Error(
      'El CSV contiene un campo entre comillas que no se ha cerrado correctamente.',
    );
  }

  if (rows.length < 2) {
    throw new Error('El CSV está vacío o no contiene registros para mostrar.');
  }

  const headers = rows[0].map((header) =>
    cleanValue(header).toUpperCase(),
  );

  const missingFields = REQUIRED_FIELDS.filter(
    (fieldName) => !headers.includes(fieldName),
  );

  if (missingFields.length > 0) {
    throw new Error(
      `No se encontraron las columnas necesarias: ${missingFields.join(', ')}.`,
    );
  }

  return rows.slice(1).map((values, index) => {
    const record = {};

    headers.forEach((header, columnIndex) => {
      record[header] = cleanValue(values[columnIndex]);
    });

    // Descarta filas que no tienen código ni nombre.
    if (!record.COD_IPRESS && !record.NOMBRE) return null;

    record.COD_IPRESS = record.COD_IPRESS || `SIN-CODIGO-${index + 1}`;
    record.NOMBRE = record.NOMBRE || 'SIN NOMBRE REGISTRADO';

    return record;
  }).filter(Boolean);
}

function uniqueValues(records, field) {
  return [...new Set(
    records
      .map((record) => record[field])
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'es'));
}

function aggregate(records, field, limit = 8) {
  const counts = new Map();

  records.forEach((record) => {
    const name = record[field] || 'SIN DATO';
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'))
    .slice(0, limit);
}

function MetricCard({ title, value, description, icon: Icon, accent }) {
  return (
    <article className="renipress-metric">
      <div className={`renipress-metric-icon ${accent}`}>
        <Icon size={21} aria-hidden="true" />
      </div>

      <div className="renipress-metric-content">
        <span>{title}</span>
        <strong>{formatNumber(value)}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}

function BarPanel({ title, subtitle, items, totalRecords }) {
  const maxValue = Math.max(...items.map((item) => item.total), 1);

  return (
    <section className="renipress-chart-card">
      <div className="renipress-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="renipress-no-chart-data">
          No hay información disponible para este gráfico.
        </p>
      ) : (
        <div className="renipress-bars">
          {items.map((item) => {
            const percentage = totalRecords
              ? (item.total / totalRecords) * 100
              : 0;

            return (
              <div className="renipress-bar-row" key={item.name}>
                <div className="renipress-bar-label">
                  <span title={item.name}>{item.name}</span>
                  <strong>{formatNumber(item.total)}</strong>
                </div>

                <div
                  className="renipress-bar-track"
                  role="img"
                  aria-label={`${item.name}: ${formatNumber(item.total)} registros`}
                  title={`${percentage.toFixed(1)}% de los registros`}
                >
                  <div
                    className="renipress-bar-fill"
                    style={{
                      width: `${Math.max((item.total / maxValue) * 100, 1)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RenipressPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState('');
  const [classification, setClassification] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  async function loadDataset(signal) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(renipressUrl, { signal });

      if (!response.ok) {
        throw new Error(
          `No se pudo descargar el archivo CSV (HTTP ${response.status}).`,
        );
      }

      const csvText = await response.text();
      const parsedRecords = parseCsv(csvText);

      if (parsedRecords.length === 0) {
        throw new Error('El dataset no contiene registros válidos.');
      }

      setRecords(parsedRecords);
      setPage(1);
    } catch (loadError) {
      if (loadError.name === 'AbortError') return;

      setRecords([]);
      setError(
        loadError.message ||
        'Ocurrió un error inesperado al cargar el dataset RENIPRESS.',
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadDataset(controller.signal);

    return () => controller.abort();
  }, []);

  const departments = useMemo(
    () => uniqueValues(records, 'DEPARTAMENTO'),
    [records],
  );

  const institutions = useMemo(
    () => uniqueValues(records, 'INSTITUCION'),
    [records],
  );

  const categories = useMemo(
    () => uniqueValues(records, 'CATEGORIA'),
    [records],
  );

  const classifications = useMemo(
    () => uniqueValues(records, 'CLASIFICACION'),
    [records],
  );

  const statuses = useMemo(
    () => uniqueValues(records, 'ESTADO'),
    [records],
  );

  const activeCount = useMemo(
    () => records.filter(
      (record) => record.ESTADO.toLocaleUpperCase('es-PE') === 'ACTIVO',
    ).length,
    [records],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-PE');

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        [
          record.COD_IPRESS,
          record.NOMBRE,
          record.DIRECCION,
          record.DISTRITO,
          record.PROVINCIA,
          record.UBIGEO,
        ].some((value) =>
          (value || '').toLocaleLowerCase('es-PE').includes(query),
        );

      return (
        matchesSearch &&
        (!department || record.DEPARTAMENTO === department) &&
        (!institution || record.INSTITUCION === institution) &&
        (!category || record.CATEGORIA === category) &&
        (!classification || record.CLASIFICACION === classification) &&
        (!status || record.ESTADO === status)
      );
    });
  }, [
    records,
    search,
    department,
    institution,
    category,
    classification,
    status,
  ]);

  const departmentStats = useMemo(
    () => aggregate(filteredRecords, 'DEPARTAMENTO', 8),
    [filteredRecords],
  );

  const institutionStats = useMemo(
    () => aggregate(filteredRecords, 'INSTITUCION', 8),
    [filteredRecords],
  );

  const categoryStats = useMemo(
    () => aggregate(filteredRecords, 'CATEGORIA', 8),
    [filteredRecords],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, pageCount);

  const visibleRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setDepartment('');
    setInstitution('');
    setCategory('');
    setClassification('');
    setStatus('');
    setPage(1);
  }

  const filtersActive = Boolean(
    search ||
    department ||
    institution ||
    category ||
    classification ||
    status,
  );

  return (
    <div className="assistencial-page renipress-page">
      <header className="renipress-header">
        <div className="renipress-header-copy">
          <span className="renipress-eyebrow">
            STASYS / FUENTES DE DATOS / IPRESS
          </span>
          <h1>Directorio RENIPRESS</h1>
          <p>
            Explora y analiza los establecimientos de salud registrados en el dataset.
          </p>
        </div>

        <div className="renipress-source-card">
          <span className="renipress-source-icon">
            <Database size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Dataset local</strong>
            <span>
              {loading
                ? 'Cargando archivo CSV…'
                : error
                  ? 'No disponible'
                  : 'Archivo CSV cargado'}
            </span>
          </div>
          {!loading && !error && (
            <CheckCircle2
              className="renipress-source-check"
              size={19}
              aria-label="Carga correcta"
            />
          )}
        </div>
      </header>

      {loading && (
        <section className="renipress-state-card" aria-live="polite">
          <LoaderCircle className="renipress-spinner" size={27} />
          <div>
            <h2>Cargando dataset RENIPRESS</h2>
            <p>Estamos leyendo y procesando los registros del archivo CSV.</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="renipress-state-card renipress-error" role="alert">
          <AlertTriangle size={26} />
          <div>
            <h2>No se pudo cargar RENIPRESS</h2>
            <p>{error}</p>
            <p>
              Verifica que el CSV exista en la ruta configurada y que sus columnas
              coincidan con las esperadas.
            </p>
            <button
              className="renipress-button renipress-button-primary"
              type="button"
              onClick={() => {
                const controller = new AbortController();
                loadDataset(controller.signal);
              }}
            >
              <RefreshCw size={16} />
              Reintentar carga
            </button>
          </div>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="renipress-data-banner">
            <div className="renipress-data-banner-icon">
              <Database size={19} />
            </div>
            <div>
              <strong>Datos del archivo RENIPRESS</strong>
              <p>
                Indicadores y gráficos calculados desde los registros cargados.
                La información corresponde a la versión local del CSV.
              </p>
            </div>
            <span className="renipress-data-badge">
              <span />
              Conectado
            </span>
          </section>

          <section className="renipress-metrics" aria-label="Indicadores generales">
            <MetricCard
              title="Total de IPRESS"
              value={records.length}
              description="Registros válidos cargados"
              icon={Building2}
              accent="blue"
            />
            <MetricCard
              title="IPRESS activas"
              value={activeCount}
              description={
                records.length
                  ? `${((activeCount / records.length) * 100).toFixed(1)}% del total`
                  : 'Sin registros'
              }
              icon={Activity}
              accent="green"
            />
            <MetricCard
              title="Departamentos"
              value={departments.length}
              description="Con presencia en el dataset"
              icon={MapPin}
              accent="violet"
            />
            <MetricCard
              title="Instituciones"
              value={institutions.length}
              description="Tipos registrados en el archivo"
              icon={Database}
              accent="amber"
            />
          </section>

          <section className="renipress-analytics">
            <div className="renipress-section-title">
              <div>
                <span className="renipress-section-kicker">ANÁLISIS DEL DATASET</span>
                <h2>Distribución de establecimientos</h2>
                <p>
                  Los gráficos se actualizan al cambiar los filtros del directorio.
                </p>
              </div>
              <span className="renipress-chart-total">
                {formatNumber(filteredRecords.length)} registros analizados
              </span>
            </div>

            <div className="renipress-chart-grid">
              <BarPanel
                title="Por departamento"
                subtitle="Departamentos con más registros"
                items={departmentStats}
                totalRecords={filteredRecords.length}
              />
              <BarPanel
                title="Por institución"
                subtitle="Distribución institucional"
                items={institutionStats}
                totalRecords={filteredRecords.length}
              />
              <BarPanel
                title="Por categoría"
                subtitle="Categorías más frecuentes"
                items={categoryStats}
                totalRecords={filteredRecords.length}
              />
            </div>
          </section>

          <section className="renipress-directory">
            <div className="renipress-directory-header">
              <div>
                <span className="renipress-section-kicker">CONSULTA DE DATOS</span>
                <h2>Directorio de establecimientos</h2>
                <p>
                  Busca por nombre o código y combina los filtros disponibles.
                </p>
              </div>
              <div className="renipress-result-pill">
                <strong>{formatNumber(filteredRecords.length)}</strong>
                <span>resultados</span>
              </div>
            </div>

            <div className="renipress-filters">
              <label className="renipress-filter renipress-search-filter">
                <span>Buscar establecimiento</span>
                <div className="renipress-search-control">
                  <Search size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      updateFilter(setSearch, event.target.value)
                    }
                    placeholder="Código, nombre, dirección o distrito"
                  />
                </div>
              </label>

              {[
                {
                  label: 'Departamento',
                  value: department,
                  setter: setDepartment,
                  options: departments,
                },
                {
                  label: 'Institución',
                  value: institution,
                  setter: setInstitution,
                  options: institutions,
                },
                {
                  label: 'Categoría',
                  value: category,
                  setter: setCategory,
                  options: categories,
                },
                {
                  label: 'Clasificación',
                  value: classification,
                  setter: setClassification,
                  options: classifications,
                },
                {
                  label: 'Estado',
                  value: status,
                  setter: setStatus,
                  options: statuses,
                },
              ].map((filter) => (
                <label className="renipress-filter" key={filter.label}>
                  <span>{filter.label}</span>
                  <div className="renipress-select-control">
                    <select
                      value={filter.value}
                      onChange={(event) =>
                        updateFilter(filter.setter, event.target.value)
                      }
                    >
                      <option value="">Todos</option>
                      {filter.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                </label>
              ))}

              <button
                className="renipress-button renipress-button-secondary renipress-clear-button"
                type="button"
                onClick={clearFilters}
                disabled={!filtersActive}
              >
                <RotateCcw size={15} />
                Limpiar filtros
              </button>
            </div>

            <div className="renipress-table-meta">
              <span>
                Mostrando{' '}
                <strong>
                  {filteredRecords.length
                    ? formatNumber((currentPage - 1) * PAGE_SIZE + 1)
                    : '0'}
                  {'–'}
                  {formatNumber(
                    Math.min(currentPage * PAGE_SIZE, filteredRecords.length),
                  )}
                </strong>{' '}
                de <strong>{formatNumber(filteredRecords.length)}</strong> registros
              </span>
              <span className="renipress-scroll-hint">
                Desliza horizontalmente para ver todas las columnas
              </span>
            </div>

            <div className="renipress-table-scroll">
              <table className="renipress-table">
                <thead>
                  <tr>
                    <th>Código IPRESS</th>
                    <th>Establecimiento</th>
                    <th>Institución</th>
                    <th>Clasificación</th>
                    <th>Categoría</th>
                    <th>Departamento</th>
                    <th>Provincia</th>
                    <th>Distrito</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record, index) => (
                    <tr key={`${record.COD_IPRESS}-${index}`}>
                      <td>
                        <span className="renipress-code">
                          {record.COD_IPRESS}
                        </span>
                      </td>
                      <td>
                        <strong className="renipress-establishment-name">
                          {record.NOMBRE}
                        </strong>
                        {record.DIRECCION && (
                          <small className="renipress-address">
                            {record.DIRECCION}
                          </small>
                        )}
                      </td>
                      <td>{record.INSTITUCION || '—'}</td>
                      <td>{record.CLASIFICACION || '—'}</td>
                      <td>
                        <span className="renipress-category">
                          {record.CATEGORIA || 'Sin categoría'}
                        </span>
                      </td>
                      <td>{record.DEPARTAMENTO || '—'}</td>
                      <td>{record.PROVINCIA || '—'}</td>
                      <td>{record.DISTRITO || '—'}</td>
                      <td>
                        <span
                          className={`renipress-status ${
                            record.ESTADO.toLocaleUpperCase('es-PE') === 'ACTIVO'
                              ? 'is-active'
                              : 'is-other'
                          }`}
                        >
                          <span />
                          {record.ESTADO || 'SIN ESTADO'}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {visibleRecords.length === 0 && (
                    <tr>
                      <td colSpan={9} className="renipress-empty">
                        <Search size={25} />
                        <strong>No se encontraron establecimientos</strong>
                        <span>
                          Prueba con otro término o modifica los filtros.
                        </span>
                        <button
                          className="renipress-button renipress-button-secondary"
                          type="button"
                          onClick={clearFilters}
                        >
                          Limpiar búsqueda
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="renipress-pagination">
              <span>
                Página <strong>{currentPage}</strong> de{' '}
                <strong>{pageCount}</strong>
              </span>

              <div>
                <button
                  className="renipress-button renipress-button-secondary"
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((previous) => Math.max(1, previous - 1))
                  }
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button
                  className="renipress-button renipress-button-primary"
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(pageCount, previous + 1),
                    )
                  }
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <footer className="renipress-directory-footer">
              <span>
                <Database size={15} />
                Fuente: RENIPRESS CSV local
              </span>
              <span>
                {formatNumber(records.length)} registros cargados ·{' '}
                {PAGE_SIZE} por página
              </span>
            </footer>
          </section>

          <footer className="renipress-page-footer">
            STASYS · RENIPRESS · Panel de análisis de establecimientos de salud
          </footer>
        </>
      )}
    </div>
  );
}

export default RenipressPage;
