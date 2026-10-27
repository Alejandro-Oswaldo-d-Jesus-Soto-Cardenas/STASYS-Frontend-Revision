
import { useEffect, useMemo, useState } from "react";
import peruGeoJsonUrl from "../../../assets/maps/peru-geojson-master/peru_departamental_simple.geojson?url";
import produccionCsv from "../../../assets/datasets-dashboard/c1_produccion_por_departamento.csv?raw";
import { MapPin, Activity, Users, Info, RefreshCw } from "lucide-react";

const MAP_WIDTH = 700;
const MAP_HEIGHT = 700;
const MAP_PADDING = 24;

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function normalizeCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? digits.padStart(2, "0") : "";
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(String(value).trim().replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function parseCsvLine(line, delimiter) {
  const fields = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];

    if (character === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === delimiter && !insideQuotes) {
      fields.push(field.trim());
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field.trim());
  return fields;
}

function parseProductionCsv(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeText);

  const codeIndex = headers.indexOf("DEPARTAMENTO_CODIGO");
  const nameIndex = headers.findIndex((header) =>
    ["DEPARTAMENTO", "NOMBDEP", "NOMBRE_DEPARTAMENTO"].includes(header)
  );
  const atencionesIndex = headers.indexOf("TOTAL_ATENCIONES");
  const atendidosIndex = headers.indexOf("TOTAL_ATENDIDOS");

  if (codeIndex === -1 && nameIndex === -1) {
    console.error("STASYS: no se encontró el código o nombre del departamento.", headers);
    return [];
  }

  if (atencionesIndex === -1 || atendidosIndex === -1) {
    console.error("STASYS: faltan las columnas total_atenciones o total_atendidos.", headers);
    return [];
  }

  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line, delimiter);

    return {
      code: codeIndex >= 0 ? normalizeCode(fields[codeIndex]) : "",
      name: nameIndex >= 0 ? normalizeText(fields[nameIndex] || "") : "",
      atenciones: toNumber(fields[atencionesIndex]),
      atendidos: toNumber(fields[atendidosIndex]),
    };
  });
}

function collectPositions(coordinates, result = []) {
  if (!Array.isArray(coordinates)) return result;

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    result.push(coordinates);
    return result;
  }

  coordinates.forEach((item) => collectPositions(item, result));
  return result;
}

function getRings(geometry) {
  if (!geometry) return [];

  if (geometry.type === "Polygon") {
    return geometry.coordinates || [];
  }

  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates || []).flatMap((polygon) => polygon);
  }

  return [];
}

function getDepartmentName(feature) {
  const properties = feature?.properties || {};

  return (
    properties.NOMBDEP ||
    properties.nombdep ||
    properties.DEPARTAMENTO ||
    properties.departamento ||
    properties.NAME_1 ||
    properties.name ||
    properties.NOMBDEPTO ||
    "Departamento sin nombre"
  );
}

function getDepartmentCode(feature) {
  const properties = feature?.properties || {};

  const rawCode =
    properties.FIRST_IDDP ??
    properties.first_iddp ??
    properties.IDDP ??
    properties.iddp ??
    properties.CODDEP ??
    properties.coddep ??
    properties.DEPARTAMENTO_CODIGO ??
    properties.CCDD ??
    properties.ccdd ??
    properties.CODIGO ??
    "";

  return normalizeCode(rawCode);
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function PeruDepartmentMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const productionData = useMemo(
    () => parseProductionCsv(produccionCsv),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        setLoading(true);
        setMapError("");

        const response = await fetch(peruGeoJsonUrl);

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} al cargar el mapa.`);
        }

        const data = await response.json();

        if (!Array.isArray(data?.features)) {
          throw new Error("El GeoJSON no contiene una lista válida de departamentos.");
        }

        if (!cancelled) setGeoJsonData(data);
      } catch (error) {
        console.error("STASYS - Error al cargar el GeoJSON:", error);

        if (!cancelled) {
          setMapError(error.message || "No se pudo cargar el mapa.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapFeatures = useMemo(() => {
    if (!geoJsonData?.features?.length) return [];

    const dataByCode = new Map();
    const dataByName = new Map();

    productionData.forEach((row) => {
      if (row.code) dataByCode.set(row.code, row);
      if (row.name) dataByName.set(row.name, row);
    });

    const sourceFeatures = geoJsonData.features.map((feature, index) => {
      const name = getDepartmentName(feature);
      const code = getDepartmentCode(feature);

      const row =
        (code ? dataByCode.get(code) : null) ||
        dataByName.get(normalizeText(name)) ||
        null;

      return {
        id: `${code || normalizeText(name)}-${index}`,
        name,
        code,
        geometry: feature.geometry,
        atenciones: row ? row.atenciones : null,
        atendidos: row ? row.atendidos : null,
        hasData: Boolean(row),
      };
    });

    const allPositions = sourceFeatures.flatMap((feature) =>
      collectPositions(feature.geometry?.coordinates)
    );

    if (!allPositions.length) return [];

    const longitudes = allPositions.map(([longitude]) => longitude);
    const latitudes = allPositions.map(([, latitude]) => latitude);

    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);

    const longitudeRange = maxLongitude - minLongitude || 1;
    const latitudeRange = maxLatitude - minLatitude || 1;

    const scale = Math.min(
      (MAP_WIDTH - MAP_PADDING * 2) / longitudeRange,
      (MAP_HEIGHT - MAP_PADDING * 2) / latitudeRange
    );

    const drawnWidth = longitudeRange * scale;
    const drawnHeight = latitudeRange * scale;
    const offsetX = (MAP_WIDTH - drawnWidth) / 2;
    const offsetY = (MAP_HEIGHT - drawnHeight) / 2;

    const project = ([longitude, latitude]) => [
      offsetX + (longitude - minLongitude) * scale,
      MAP_HEIGHT - offsetY - (latitude - minLatitude) * scale,
    ];

    const makePath = (geometry) =>
      getRings(geometry)
        .map((ring) => {
          if (!ring?.length) return "";

          return (
            ring
              .map((coordinate, index) => {
                const [x, y] = project(coordinate);
                return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
              })
              .join(" ") + " Z"
          );
        })
        .join(" ");

    return sourceFeatures.map((feature) => ({
      ...feature,
      path: makePath(feature.geometry),
    }));
  }, [geoJsonData, productionData]);

  const totals = useMemo(() => {
    const withData = mapFeatures.filter((feature) => feature.hasData);

    return {
      departmentsWithData: withData.length,
      departmentsOnMap: mapFeatures.length,
      atenciones: withData.reduce((sum, feature) => sum + feature.atenciones, 0),
      atendidos: withData.reduce((sum, feature) => sum + feature.atendidos, 0),
    };
  }, [mapFeatures]);

  const maxAtenciones = useMemo(
    () => Math.max(1, ...mapFeatures.map((feature) => feature.atenciones || 0)),
    [mapFeatures]
  );

  function getDepartmentFill(feature) {
    if (!feature.hasData) return "#e8edf3";

    const intensity = (feature.atenciones || 0) / maxAtenciones;

    if (intensity >= 0.7) return "#075985";
    if (intensity >= 0.4) return "#0e7490";
    if (intensity >= 0.15) return "#38a3b5";
    return "#a5dce2";
  }

  if (loading) {
    return (
      <section className="peru-map-card">
        <div className="peru-map-message">
          <RefreshCw size={22} className="peru-map-spinner" />
          <p>Cargando mapa de departamentos del Perú...</p>
        </div>
      </section>
    );
  }

  if (mapError) {
    return (
      <section className="peru-map-card">
        <div className="peru-map-message peru-map-error">
          <Info size={24} />
          <p>{mapError}</p>
          <button
            type="button"
            className="peru-map-retry"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      </section>
    );
  }

  if (!mapFeatures.length) {
    return (
      <section className="peru-map-card">
        <div className="peru-map-message">
          <Info size={24} />
          <p>No se pudieron preparar los departamentos del mapa.</p>
          <p>Revisa el archivo GeoJSON.</p>
        </div>
      </section>
    );
  }

  const selected =
    mapFeatures.find((feature) => feature.id === selectedDepartment) || null;

  return (
    <section className="peru-map-card">
      <div className="peru-map-layout">
        <div className="peru-map-main">
          <div className="peru-map-header">
            <div>
              <span className="peru-map-eyebrow">STASYS · DATOS GEOGRÁFICOS</span>
              <h3>Producción asistencial por departamento</h3>
              <p>
                Selecciona un departamento para consultar las atenciones y
                personas atendidas registradas en el dataset C1.
              </p>
            </div>

            <div className="peru-map-icon">
              <MapPin size={22} />
            </div>
          </div>

          <div className="peru-map-legend">
            <span>Menor producción</span>
            <span className="peru-map-legend-scale">
              <i style={{ backgroundColor: "#a5dce2" }} />
              <i style={{ backgroundColor: "#38a3b5" }} />
              <i style={{ backgroundColor: "#0e7490" }} />
              <i style={{ backgroundColor: "#075985" }} />
            </span>
            <span>Mayor producción</span>
            <span className="peru-map-no-data">
              <i />
              Sin datos
            </span>
          </div>

          <div className="peru-map-svg-container">
            <svg
              className="peru-map-svg"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              role="img"
              aria-label="Mapa interactivo de producción asistencial por departamento del Perú"
            >
              {mapFeatures.map((feature) => (
                <path
                  key={feature.id}
                  d={feature.path}
                  fill={getDepartmentFill(feature)}
                  stroke={
                    selectedDepartment === feature.id ? "#f59e0b" : "#ffffff"
                  }
                  strokeWidth={selectedDepartment === feature.id ? 2.5 : 1.2}
                  strokeLinejoin="round"
                  className="peru-map-department"
                  role="button"
                  tabIndex={0}
                  aria-label={`Departamento ${feature.name}`}
                  aria-pressed={selectedDepartment === feature.id}
                  onClick={() => setSelectedDepartment(feature.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDepartment(feature.id);
                    }
                  }}
                >
                  <title>
                    {feature.name}
                    {feature.hasData
                      ? ` — Atenciones: ${formatNumber(feature.atenciones)}`
                      : " — Sin datos en el CSV"}
                  </title>
                </path>
              ))}
            </svg>
          </div>

          <div className="peru-map-footnote">
            <Info size={16} />
            <span>
              Los departamentos en gris no tienen registros coincidentes en el
              CSV. Esto no significa que su producción sea cero.
            </span>
          </div>
        </div>

        <aside className="peru-map-sidebar">
          <div className="peru-map-summary">
            <span className="peru-map-summary-label">Cobertura del dataset</span>
            <strong>
              {totals.departmentsWithData} / {totals.departmentsOnMap}
            </strong>
            <span className="peru-map-summary-caption">
              departamentos con datos
            </span>

            <div className="peru-map-progress">
              <span
                style={{
                  width: `${
                    totals.departmentsOnMap
                      ? (totals.departmentsWithData / totals.departmentsOnMap) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="peru-map-detail">
            <div className="peru-map-detail-heading">
              <MapPin size={18} />
              <h4>Detalle del departamento</h4>
            </div>

            {selected ? (
              <>
                <h3 className="peru-map-selected-name">{selected.name}</h3>

                {selected.hasData ? (
                  <>
                    <div className="peru-map-metric">
                      <span className="peru-map-metric-icon">
                        <Activity size={18} />
                      </span>
                      <div>
                        <span>Atenciones registradas</span>
                        <strong>{formatNumber(selected.atenciones)}</strong>
                      </div>
                    </div>

                    <div className="peru-map-metric">
                      <span className="peru-map-metric-icon">
                        <Users size={18} />
                      </span>
                      <div>
                        <span>Atendidos registrados</span>
                        <strong>{formatNumber(selected.atendidos)}</strong>
                      </div>
                    </div>

                    <div className="peru-map-share">
                      <div className="peru-map-share-label">
                        <span>Participación en las atenciones disponibles</span>
                        <strong>
                          {totals.atenciones > 0
                            ? `${(
                                (selected.atenciones / totals.atenciones) *
                                100
                              ).toFixed(1)}%`
                            : "—"}
                        </strong>
                      </div>
                      <div className="peru-map-progress">
                        <span
                          style={{
                            width: `${
                              totals.atenciones > 0
                                ? Math.min(
                                    100,
                                    (selected.atenciones / totals.atenciones) * 100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="peru-map-no-record">
                    <Info size={20} />
                    <p>
                      No se encontraron registros para este departamento en el
                      archivo C1 integrado.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="peru-map-empty">
                <MapPin size={28} />
                <p>Selecciona un departamento del mapa.</p>
                <span>Los indicadores aparecerán aquí.</span>
              </div>
            )}
          </div>

          <div className="peru-map-national">
            <span>Totales de los registros disponibles</span>
            <div>
              <span>Atenciones</span>
              <strong>{formatNumber(totals.atenciones)}</strong>
            </div>
            <div>
              <span>Atendidos</span>
              <strong>{formatNumber(totals.atendidos)}</strong>
            </div>
          </div>
        </aside>
      </div>

      <div className="peru-map-data-note">
        <Info size={16} />
        <p>
          <strong>Nota sobre los datos:</strong> las cifras corresponden al
          archivo C1 integrado en el proyecto. Verifica el periodo y la
          cobertura antes de interpretarlas como indicadores actuales o como el
          total nacional.
        </p>
      </div>
    </section>
  );
}
