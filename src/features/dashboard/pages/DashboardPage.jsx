
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  Database,
  FileCheck2,
  Pill,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import fuentesCsv from "../../../assets/datasets-dashboard/resumen_fuentes.csv?raw";
import ipressKpiCsv from "../../../assets/datasets-dashboard/kpi_ipress.csv?raw";
import ipressInstitucionCsv from "../../../assets/datasets-dashboard/ipress_por_institucion.csv?raw";
import ipressCategoriaCsv from "../../../assets/datasets-dashboard/ipress_por_categoria.csv?raw";
import consultasTipoCsv from "../../../assets/datasets-dashboard/consultas_por_tipo.csv?raw";
import consultasGeneroCsv from "../../../assets/datasets-dashboard/consultas_por_genero.csv?raw";
import c1AnualCsv from "../../../assets/datasets-dashboard/c1_produccion_anual.csv?raw";
import farmaciaKpiCsv from "../../../assets/datasets-dashboard/kpi_farmacia_resumen.csv?raw";
import epsKpiCsv from "../../../assets/datasets-dashboard/kpi_eps_resumen.csv?raw";

import PeruDepartmentMap from "../components/PeruDepartmentMap.jsx";

const OFFICIAL_SOURCES = {
  c1: {
    title: "Producción asistencial en emergencia",
    shortTitle: "Consulta C1",
    description:
      "Atenciones y personas atendidas en los servicios de emergencia de las IPRESS.",
    period: "2015",
    url: "http://datos.susalud.gob.pe/dataset/consulta-c1-producci%C3%B3n-asistencial-en-emergencia-2015",
    icon: Activity,
    color: "blue",
  },
  consultas: {
    title: "Consultas y denuncias por protección de derechos",
    shortTitle: "Consultas y denuncias",
    description:
      "Registros de consultas, denuncias e intervenciones de oficio en el sector salud.",
    period: "2019–2026",
    url: "http://datos.susalud.gob.pe/dataset/reporte-anonimizado-de-consultas-y-denuncias-por-protecci%C3%B3n-de-derechos-en-salud-nivel",
    icon: ClipboardList,
    color: "teal",
  },
  renipress: {
    title: "Registro Nacional de IPRESS",
    shortTitle: "RENIPRESS",
    description:
      "Información del registro de instituciones prestadoras de servicios de salud.",
    period: "Corte 2026",
    url: "http://datos.susalud.gob.pe/dataset/registro-nacional-de-ipress-renipress",
    icon: Building2,
    color: "purple",
  },
  eps: {
    title: "Prestaciones liquidadas por las IAFAS EPS",
    shortTitle: "Liquidaciones EPS",
    description:
      "Prestaciones, gastos médicos y montos presentados por las entidades prestadoras de salud.",
    period: "Agosto 2025",
    url: "https://www.datosabiertos.gob.pe/dataset/prestaciones-de-salud-liquidadas-por-las-entidades-prestadoras-de-salud-iafas-eps/resource-6",
    icon: Wallet,
    color: "orange",
  },
  farmacia: {
    title: "Registro de datos de farmacia",
    shortTitle: "Farmacia privada",
    description:
      "Registros de cobertura farmacéutica, ventas y posibles diferencias en los montos.",
    period: "Septiembre 2026",
    url: "https://www.datosabiertos.gob.pe/dataset/registro-de-datos-de-farmacia-de-la-cobertura-prestacional-de-salud-del-sector-privado-13",
    icon: Pill,
    color: "green",
  },
};

function parseCsv(csvText) {
  const text = csvText.replace(/^\uFEFF/, "").trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);

  function splitLine(line) {
    const values = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        values.push(value.trim());
        value = "";
      } else {
        value += char;
      }
    }

    values.push(value.trim());
    return values;
  }

  const headers = splitLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, ""),
  );

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 0,
  }).format(numberValue(value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(numberValue(value));
}

function percentage(part, total) {
  if (!numberValue(total)) return "0.00";
  return ((numberValue(part) / numberValue(total)) * 100).toFixed(2);
}

const sourceRows = parseCsv(fuentesCsv);
const ipressKpi = parseCsv(ipressKpiCsv)[0] ?? {};
const institutionRows = parseCsv(ipressInstitucionCsv);
const categoryRows = parseCsv(ipressCategoriaCsv);
const consultationTypes = parseCsv(consultasTipoCsv);
const genderRows = parseCsv(consultasGeneroCsv);
const c1Kpi = parseCsv(c1AnualCsv)[0] ?? {};
const pharmacyKpi = parseCsv(farmaciaKpiCsv)[0] ?? {};
const epsKpi = parseCsv(epsKpiCsv)[0] ?? {};

const sourceCount = Object.fromEntries(
  sourceRows.map((row) => [row.rol, numberValue(row.filas_silver)]),
);

function KpiCard({ icon: Icon, label, value, detail, color }) {
  return (
    <article className="home-kpi-card">
      <div className={`home-kpi-icon ${color}`}>
        <Icon size={22} strokeWidth={1.9} />
      </div>

      <div className="home-kpi-content">
        <span className="home-kpi-label">{label}</span>
        <strong className="home-kpi-value">{value}</strong>
        <span className="home-kpi-detail">{detail}</span>
      </div>
    </article>
  );
}

function HorizontalBars({
  title,
  subtitle,
  rows,
  labelKey,
  valueKey,
  limit = 6,
}) {
  const visibleRows = rows
    .map((row) => ({
      label: row[labelKey] || "Sin especificar",
      value: numberValue(row[valueKey]),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const maxValue = Math.max(...visibleRows.map((row) => row.value), 1);

  return (
    <section className="home-panel">
      <div className="home-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <ChartNoAxesCombined size={20} />
      </div>

      <div className="home-bars">
        {visibleRows.map((row) => (
          <div className="home-bar-row" key={row.label}>
            <div className="home-bar-label">
              <span title={row.label}>{row.label}</span>
              <strong>{formatNumber(row.value)}</strong>
            </div>

            <div
              className="home-bar-track"
              role="img"
              aria-label={`${row.label}: ${formatNumber(row.value)}`}
            >
              <div
                className="home-bar-fill"
                style={{ width: `${(row.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DonutChart({ title, subtitle, rows, labelKey, valueKey }) {
  const colors = ["#2474c6", "#22a6a1", "#8b79d9", "#f2aa4c", "#d66b83"];

  const total = rows.reduce(
    (sum, row) => sum + numberValue(row[valueKey]),
    0,
  );

  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  const segments = rows
    .map((row, index) => {
      const value = numberValue(row[valueKey]);
      const length = total > 0 ? (value / total) * circumference : 0;

      const segment = {
        label: row[labelKey] || "Sin especificar",
        value,
        color: colors[index % colors.length],
        length,
        offset: accumulated,
      };

      accumulated += length;
      return segment;
    })
    .filter((segment) => segment.value > 0);

  return (
    <section className="home-panel">
      <div className="home-panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="home-donut-layout">
        <div className="home-donut-visual">
          <svg
            viewBox="0 0 180 180"
            role="img"
            aria-label={`${title}. Total: ${formatNumber(total)}`}
          >
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="#edf2f8"
              strokeWidth="19"
            />

            <g transform="rotate(-90 90 90)">
              {segments.map((segment) => (
                <circle
                  key={segment.label}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="19"
                  strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                  strokeDashoffset={-segment.offset}
                />
              ))}
            </g>

            <text
              x="90"
              y="86"
              textAnchor="middle"
              className="home-donut-total"
            >
              {formatNumber(total)}
            </text>

            <text
              x="90"
              y="105"
              textAnchor="middle"
              className="home-donut-caption"
            >
              registros
            </text>
          </svg>
        </div>

        <ul className="home-donut-legend">
          {segments.map((segment) => (
            <li key={segment.label}>
              <span
                className="home-donut-dot"
                style={{ background: segment.color }}
              />
              <span className="home-donut-label" title={segment.label}>
                {segment.label}
              </span>
              <strong>{percentage(segment.value, total)}%</strong>
              <small>{formatNumber(segment.value)}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DatasetCard({ dataset, rows }) {
  const Icon = dataset.icon;

  return (
    <article className="home-dataset-card">
      <div className={`home-dataset-icon ${dataset.color}`}>
        <Icon size={22} />
      </div>

      <div className="home-dataset-period">{dataset.period}</div>
      <h3>{dataset.shortTitle}</h3>
      <p className="home-dataset-description">{dataset.description}</p>

      <div className="home-dataset-count">
        <Database size={15} />
        <span>{formatNumber(rows)} filas en el resumen procesado</span>
      </div>

      <a
        className="home-dataset-link"
        href={dataset.url}
        target="_blank"
        rel="noreferrer"
      >
        Consultar fuente oficial
        <ArrowUpRight size={16} />
      </a>
    </article>
  );
}

export default function DashboardPage() {
  const ipressTotal = numberValue(ipressKpi.total_ipress);
  const consultationsTotal = sourceCount.consultas_denuncias ?? 0;
  const c1Attentions = numberValue(c1Kpi.total_atenciones);
  const pharmacyTotal = numberValue(pharmacyKpi.total_registros);
  const epsTotal = numberValue(epsKpi.total_liquidaciones);

  const pharmacyDiscrepancies = numberValue(
    pharmacyKpi.registros_con_descuadre,
  );
  const epsDiscrepancies = numberValue(epsKpi.total_descuadres_gastos);

  return (
    <div className="dashboard-page home-dashboard">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-eyebrow">
            <ShieldCheck size={15} />
            SUSALUD · PLATAFORMA DE ANÁLISIS
          </div>

          <h1>Centro de supervisión de datos</h1>

          <p>
            Una vista general de los datos de IPRESS, protección de derechos,
            producción asistencial, farmacia y prestaciones EPS.
          </p>

          <div className="home-hero-note">
            <FileCheck2 size={16} />
            <span>
              Información consolidada desde archivos procesados. No es un
              sistema de monitoreo en tiempo real.
            </span>
          </div>
        </div>

        <div className="home-hero-art" aria-hidden="true">
          <div className="home-art-circle circle-one" />
          <div className="home-art-circle circle-two" />

          <div className="home-art-card">
            <Database size={29} />
            <strong>{formatNumber(sourceRows.length)}</strong>
            <span>fuentes de datos</span>

            <div className="home-art-dots">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">VISTA GENERAL</span>
            <h2>Indicadores principales</h2>
          </div>

          <span className="home-section-caption">
            Según los archivos disponibles
          </span>
        </div>

        <div className="home-kpi-grid">
          <KpiCard
            icon={Building2}
            color="blue"
            label="IPRESS registradas"
            value={formatNumber(ipressTotal)}
            detail="RENIPRESS · corte 2026"
          />

          <KpiCard
            icon={ClipboardList}
            color="teal"
            label="Consultas y denuncias"
            value={formatNumber(consultationsTotal)}
            detail="Periodo 2019–2026"
          />

          <KpiCard
            icon={Activity}
            color="purple"
            label="Atenciones de emergencia"
            value={formatNumber(c1Attentions)}
            detail={`Producción asistencial · ${c1Kpi.ANHO || "2015"}`}
          />

          <KpiCard
            icon={Pill}
            color="green"
            label="Registros de farmacia"
            value={formatNumber(pharmacyTotal)}
            detail="Septiembre 2026"
          />
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">ANÁLISIS RESUMIDO</span>
            <h2>¿Qué contienen los datos?</h2>
          </div>
        </div>

        <div className="home-analysis-grid">
          <DonutChart
            title="Tipos de solicitud"
            subtitle="Participación de cada tipo en los registros"
            rows={consultationTypes}
            labelKey="tipo_solicitud"
            valueKey="total_consultas"
          />

          <DonutChart
            title="Consultas por género"
            subtitle="Distribución según el género informado"
            rows={genderRows}
            labelKey="genero"
            valueKey="total_consultas"
          />

          <HorizontalBars
            title="IPRESS por institución"
            subtitle="Instituciones con más establecimientos registrados"
            rows={institutionRows}
            labelKey="institucion"
            valueKey="total_ipress"
            limit={6}
          />

          <HorizontalBars
            title="IPRESS por categoría"
            subtitle="Categorías con más establecimientos registrados"
            rows={categoryRows}
            labelKey="categoria"
            valueKey="total_ipress"
            limit={6}
          />

          <section className="home-panel home-financial-panel">
            <div className="home-panel-heading">
              <div>
                <h2>Prestaciones y gastos</h2>
                <p>Resumen de farmacia y liquidaciones EPS</p>
              </div>
              <Wallet size={20} />
            </div>

            <div className="home-financial-item">
              <div className="home-financial-icon pharmacy">
                <Pill size={18} />
              </div>

              <div className="home-financial-copy">
                <span>Venta registrada en farmacia</span>
                <strong>
                  {formatCurrency(pharmacyKpi.monto_total_venta)}
                </strong>
                <small>
                  {formatNumber(pharmacyDiscrepancies)} registros con descuadre
                  · {percentage(pharmacyDiscrepancies, pharmacyTotal)}%
                </small>
              </div>
            </div>

            <div className="home-financial-item">
              <div className="home-financial-icon eps">
                <Wallet size={18} />
              </div>

              <div className="home-financial-copy">
                <span>Monto presentado por EPS</span>
                <strong>
                  {formatCurrency(epsKpi.monto_total_presentado)}
                </strong>
                <small>
                  {formatNumber(epsDiscrepancies)} descuadres de gastos
                  · {percentage(epsDiscrepancies, epsTotal)}%
                </small>
              </div>
            </div>

            <p className="home-data-caveat">
              Los descuadres son observaciones detectadas durante el
              procesamiento y no implican por sí solos irregularidades
              confirmadas.
            </p>
          </section>
        </div>
      </section>

      {/* NUEVA SECCIÓN: MAPA INTERACTIVO DEL PERÚ */}
      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">
              ANÁLISIS GEOGRÁFICO
            </span>

            <h2>Distribución territorial</h2>

            <p className="home-section-description">
              Explora la producción asistencial por departamento utilizando
              los registros del dataset C1.
            </p>
          </div>
        </div>

        <PeruDepartmentMap />
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-kicker">CATÁLOGO DE DATOS</span>
            <h2>Explora los datasets</h2>
            <p className="home-section-description">
              Selecciona una fuente para consultar su publicación oficial.
              Las páginas de análisis detallado se incorporarán por separado.
            </p>
          </div>
        </div>

        <div className="home-dataset-grid">
          <DatasetCard
            dataset={OFFICIAL_SOURCES.renipress}
            rows={sourceCount.renipress}
          />

          <DatasetCard
            dataset={OFFICIAL_SOURCES.consultas}
            rows={sourceCount.consultas_denuncias}
          />

          <DatasetCard
            dataset={OFFICIAL_SOURCES.c1}
            rows={sourceCount.c1}
          />

          <DatasetCard
            dataset={OFFICIAL_SOURCES.eps}
            rows={sourceCount.eps}
          />

          <DatasetCard
            dataset={OFFICIAL_SOURCES.farmacia}
            rows={sourceCount.farmacia}
          />
        </div>
      </section>

      <section className="home-bottom-note">
        <div className="home-bottom-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <strong>Nota sobre la interpretación de los indicadores</strong>
          <p>
            Los conjuntos de datos corresponden a periodos diferentes y tienen
            unidades de análisis distintas. Sus cantidades no deben sumarse ni
            compararse directamente sin considerar su definición y periodo.
            La calidad de los datos continúa en validación.
          </p>
        </div>
      </section>

      <footer className="home-footer">
        <span>STASYS · Supervisión y análisis de datos de salud</span>
        <span>
          Fuentes públicas de SUSALUD y datos abiertos del Estado Peruano
        </span>
      </footer>
    </div>
  );
}
