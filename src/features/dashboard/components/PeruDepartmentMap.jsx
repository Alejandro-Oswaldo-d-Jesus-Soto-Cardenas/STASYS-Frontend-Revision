
import { useEffect, useMemo, useState } from "react";
import { MapPin, RotateCw } from "lucide-react";
import c1DepartmentCsv from "../../../assets/datasets-dashboard/c1_produccion_por_departamento.csv?raw";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson";

const MAP_WIDTH = 460;
const MAP_HEIGHT = 570;

// Límites de visualización para la extensión geográfica del Perú.
const BOUNDS = {
  minLon: -81.5,
  maxLon: -68,
  minLat: -18.5,
  maxLat: 0.5,
};

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((item) => item.trim());

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        (values[index] ?? "").trim(),
      ]),
    );
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function projectCoordinate([longitude, latitude]) {
  const x =
    ((longitude - BOUNDS.minLon) /
      (BOUNDS.maxLon - BOUNDS.minLon)) *
    MAP_WIDTH;

  const y =
    ((BOUNDS.maxLat - latitude) /
      (BOUNDS.maxLat - BOUNDS.minLat)) *
    MAP_HEIGHT;

  return [x, y];
}

function geometryToPath(geometry) {
  if (!geometry) return "";

  let polygons = [];

  if (geometry.type === "Polygon") {
    polygons = [geometry.coordinates];
  } else if (geometry.type === "MultiPolygon") {
    polygons = geometry.coordinates;
  } else {
    return "";
  }

  return polygons
    .map((rings) =>
      rings
        .map((ring) => {
          if (!ring.length) return "";

          return ring
            .map((coordinate, index) => {
              const [x, y] = projectCoordinate(coordinate);
              return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ") + " Z";
        })
        .join(" "),
    )
    .join(" ");
}

function getDepartmentCode(feature) {
  return String(feature.properties?.FIRST_IDDP ?? "").padStart(2, "0");
}

function getDepartmentName(feature) {
  return feature.properties?.NOMBDEP ?? "Departamento";
}

function getIntensity(value, maxValue) {
  if (!value || !maxValue) return 0;

  // La raíz cuadrada evita que Lima opaque visualmente a los demás
  // departamentos por tener un volumen mucho mayor.
  return Math.sqrt(value / maxValue);
}

function getFill(value, maxValue) {
  if (!value) return "#e9eef5";

  const intensity = getIntensity(value, maxValue);

  if (intensity >= 0.8) return "#075985";
  if (intensity >= 0.6) return "#0e7490";
  if (intensity >= 0.4) return "#0891b2";
  if (intensity >= 0.2) return "#67c7d5";
  return "#bceaf0";
}

export default function PeruDepartmentMap() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCode, setSelectedCode] = useState("15");

  const departmentRows = useMemo(
    () => parseCsv(c1DepartmentCsv),
    [],
  );

  const departmentData = useMemo(() => {
    return new Map(
      departmentRows.map((row) => [
        String(row.departamento_codigo).padStart(2, "0"),
        {
          atenciones: Number(row.total_atenciones) || 0,
          atendidos: Number(row.total_atendidos) || 0,
        },
      ]),
    );
  }, [departmentRows]);

  const maxAttentions = useMemo(
    () =>
      Math.max(
        ...departmentRows.map(
          (row) => Number(row.total_atenciones) || 0,
        ),
        1,
      ),
    [departmentRows],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadMap() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(GEOJSON_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo descargar la geometría del mapa.");
        }

        const json = await response.json();

        if (!Array.isArray(json.features)) {
          throw new Error("El archivo geográfico no tiene el formato esperado.");
        }

        setGeoData(json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "No fue posible cargar el mapa. Comprueba tu conexión a Internet e inténtalo de nuevo.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMap();

    return () => controller.abort();
  }, []);

  const features = geoData?.features ?? [];

  const selectedFeature =
    features.find(
      (feature) => getDepartmentCode(feature) === selectedCode,
    ) ?? null;

  const selectedMetrics = departmentData.get(selectedCode) ?? {
    atenciones: 0,
    atendidos: 0,
  };

  const departmentsWithData = features.filter((feature) =>
    departmentData.has(getDepartmentCode(feature)),
  ).length;

  return (
    <section className="home-panel home-map-panel">
      <div className="home-panel-heading">
        <div>
          <h2>Producción asistencial por departamento</h2>
          <p>
            Mapa de distribución de las atenciones de emergencia registradas
            en el dataset C1 de 2015.
          </p>
        </div>

        <div className="home-map-heading-icon">
          <MapPin size={20} />
        </div>
      </div>

      {loading && (
        <div className="home-map-message">
          <RotateCw size={19} className="home-map-spinner" />
          <span>Cargando límites departamentales…</span>
        </div>
      )}

      {!loading && error && (
        <div className="home-map-message home-map-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setGeoData(null);
              setError("");
              setLoading(true);
              window.location.reload();
            }}
          >
            Volver a cargar
          </button>
        </div>
      )}

      {!loading && !error && geoData && (
        <div className="home-map-layout">
          <div className="home-map-visual">
            <svg
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="img"
              aria-label="Mapa departamental del Perú. Selecciona un departamento para consultar sus indicadores."
              className="home-peru-svg"
            >
              {features.map((feature) => {
                const code = getDepartmentCode(feature);
                const name = getDepartmentName(feature);
                const metrics = departmentData.get(code);
                const value = metrics?.atenciones ?? 0;
                const isSelected = code === selectedCode;

                return (
                  <path
                    key={code}
                    d={geometryToPath(feature.geometry)}
                    fill={getFill(value, maxAttentions)}
                    stroke={isSelected ? "#0f2942" : "#ffffff"}
                    strokeWidth={isSelected ? 1.8 : 0.8}
                    strokeLinejoin="round"
                    className="home-map-department"
                    role="button"
                    tabIndex={0}
                    aria-label={`${name}: ${formatNumber(value)} atenciones`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCode(code)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCode(code);
                      }
                    }}
                  >
                    <title>
                      {name}: {formatNumber(value)} atenciones
                      {metrics
                        ? ` · ${formatNumber(metrics.atendidos)} atendidos`
                        : " · Sin datos en este resumen"}
                    </title>
                  </path>
                );
              })}
            </svg>

            <div className="home-map-legend">
              <span>Menor volumen</span>
              <div className="home-map-legend-colors">
                <i style={{ background: "#bceaf0" }} />
                <i style={{ background: "#67c7d5" }} />
                <i style={{ background: "#0891b2" }} />
                <i style={{ background: "#0e7490" }} />
                <i style={{ background: "#075985" }} />
              </div>
              <span>Mayor volumen</span>
            </div>

            <p className="home-map-source-note">
              Gris: el resumen C1 no contiene registros para ese departamento.
            </p>
          </div>

          <aside className="home-map-detail">
            <span className="home-map-detail-label">
              DEPARTAMENTO SELECCIONADO
            </span>

            <h3>
              {selectedFeature
                ? getDepartmentName(selectedFeature)
                : "Selecciona un departamento"}
            </h3>

            <div className="home-map-detail-stat">
              <span>Atenciones de emergencia</span>
              <strong>{formatNumber(selectedMetrics.atenciones)}</strong>
            </div>

            <div className="home-map-detail-stat">
              <span>Personas atendidas</span>
              <strong>{formatNumber(selectedMetrics.atendidos)}</strong>
            </div>

            <div className="home-map-detail-stat">
              <span>Código departamental</span>
              <strong>{selectedCode}</strong>
            </div>

            <div className="home-map-detail-progress">
              <div className="home-map-progress-label">
                <span>Participación en las atenciones</span>
                <strong>
                  {maxAttentions
                    ? (
                        (selectedMetrics.atenciones /
                          departmentRows.reduce(
                            (sum, row) =>
                              sum + (Number(row.total_atenciones) || 0),
                            0,
                          )) *
                        100
                      ).toFixed(2)
                    : "0.00"}
                  %
                </strong>
              </div>

              <div className="home-bar-track">
                <div
                  className="home-bar-fill"
                  style={{
                    width: `${
                      departmentRows.reduce(
                        (sum, row) =>
                          sum + (Number(row.total_atenciones) || 0),
                        0,
                      )
                        ? (selectedMetrics.atenciones /
                            departmentRows.reduce(
                              (sum, row) =>
                                sum + (Number(row.total_atenciones) || 0),
                              0,
                            )) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <p className="home-map-detail-note">
              {selectedMetrics.atenciones > 0
                ? "Indicadores calculados desde el resumen departamental de C1."
                : "Este departamento no aparece en el resumen de producción asistencial cargado. No significa necesariamente que no haya tenido actividad."}
            </p>

            <div className="home-map-coverage">
              <MapPin size={16} />
              <span>
                {departmentsWithData} de {features.length} departamentos con
                datos en el resumen
              </span>
            </div>
          </aside>
        </div>
      )}

      <div className="home-map-footer">
        Fuente de indicadores: dataset C1 de SUSALUD, año 2015. La geometría
        departamental se carga desde un GeoJSON público.
      </div>
    </section>
  );
}
