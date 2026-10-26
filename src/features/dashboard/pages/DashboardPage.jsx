import {
  Activity,
  Building2,
  ClipboardList,
  MapPin,
  Users,
} from "lucide-react";
import { goldDashboardData as data, formatNumber } from "../data/goldDashboardData.js";

function Kpi({ title, value, detail, icon: Icon, color }) {
  return (
    <article className="gold-kpi">
      <div className={`gold-kpi-icon ${color}`}>
        <Icon size={23} />
      </div>
      <div className="gold-kpi-copy">
        <span>{title}</span>
        <strong>{formatNumber(value)}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function BarList({ title, subtitle, items, valueKey = "cantidad", limit = 6 }) {
  const visibleItems = items.slice(0, limit);
  const maxValue = Math.max(...visibleItems.map((item) => item[valueKey]), 1);

  return (
    <section className="panel gold-panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          <p className="gold-subtitle">{subtitle}</p>
        </div>
      </header>
      <div className="gold-bars">
        {visibleItems.map((item) => (
          <div className="gold-bar-row" key={item.nombre}>
            <div className="gold-bar-label">
              <span>{item.nombre}</span>
              <strong>{formatNumber(item[valueKey])}</strong>
            </div>
            <div
              className="gold-bar-track"
              role="img"
              aria-label={`${item.nombre}: ${formatNumber(item[valueKey])}`}
            >
              <div
                className="gold-bar-fill"
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const tipos = data.consultas.porTipo;
  const totalTipos = tipos.reduce((sum, item) => sum + item.cantidad, 0);
  const sinUbicacion = data.calidad.consultasSinUbicacion;
  const porcentajeSinUbicacion = (
    (sinUbicacion / data.consultas.total) * 100
  ).toFixed(1);

  return (
    <div className="dashboard-page gold-dashboard">
      <header className="page-heading">
        <div className="gold-eyebrow">STASYS · PLATAFORMA DE ANÁLISIS</div>
        <h1>Centro de Supervisión de Datos</h1>
        <p>
          Resumen de IPRESS, consultas, denuncias y producción asistencial
          a partir de los conjuntos de datos GOLD.
        </p>
      </header>

      <div className="gold-source-note">
        <Activity size={17} />
        <span>
          Vista basada en datos procesados. Cada indicador corresponde a su
          fuente y periodo disponible; no representa información en tiempo real.
        </span>
      </div>

      <section className="kpi-grid gold-kpi-grid" aria-label="Indicadores generales">
        <Kpi
          title="IPRESS registradas"
          value={data.ipress.total}
          detail="Estado: activo"
          icon={Building2}
          color="blue"
        />
        <Kpi
          title="Consultas y denuncias"
          value={data.consultas.total}
          detail="Registros procesados"
          icon={ClipboardList}
          color="teal"
        />
        <Kpi
          title="Atenciones asistenciales"
          value={data.produccion.atenciones}
          detail={`Año ${data.produccion.anio}`}
          icon={Activity}
          color="purple"
        />
        <Kpi
          title="Atendidos"
          value={data.produccion.atendidos}
          detail={`Producción del año ${data.produccion.anio}`}
          icon={Users}
          color="orange"
        />
      </section>

      <section className="content-grid gold-content-grid">
        <div className="panel gold-panel">
          <header className="panel-header">
            <div>
              <h2>Tipos de consulta y denuncia</h2>
              <p className="gold-subtitle">
                Distribución de los {formatNumber(totalTipos)} registros
              </p>
            </div>
          </header>
          <div className="gold-type-list">
            {tipos.map((item) => {
              const percent = (item.cantidad / totalTipos) * 100;
              return (
                <div className="gold-type-item" key={item.nombre}>
                  <div className="gold-type-heading">
                    <span>{item.nombre}</span>
                    <strong>{formatNumber(item.cantidad)}</strong>
                  </div>
                  <div className="gold-bar-track">
                    <div
                      className="gold-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <small>{percent.toFixed(1)}% del total</small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel gold-panel gold-quality-panel">
          <header className="panel-header">
            <div>
              <h2>Calidad de datos</h2>
              <p className="gold-subtitle">
                Observaciones identificadas durante el procesamiento
              </p>
            </div>
          </header>
          <div className="gold-quality-number">
            <MapPin size={22} />
            <div>
              <strong>{formatNumber(sinUbicacion)}</strong>
              <span>Registros sin ubicación</span>
            </div>
          </div>
          <div className="gold-quality-track">
            <div style={{ width: `${porcentajeSinUbicacion}%` }} />
          </div>
          <p className="gold-quality-description">
            Representan el {porcentajeSinUbicacion}% de los registros de
            consultas y denuncias. No se les asigna una ubicación estimada.
          </p>
          <div className="gold-quality-footer">
            <span>Género sin dato</span>
            <strong>{formatNumber(data.calidad.generoSinDato)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid gold-content-grid">
        <BarList
          title="IPRESS por institución"
          subtitle="Distribución de establecimientos registrados"
          items={data.ipress.porInstitucion}
          limit={6}
        />
        <BarList
          title="IPRESS por categoría"
          subtitle="Categorías más representativas"
          items={data.ipress.porCategoria}
          limit={6}
        />
      </section>

      <BarList
        title="Producción asistencial por departamento"
        subtitle={`Atenciones registradas durante ${data.produccion.anio}`}
        items={data.produccion.porDepartamento}
        valueKey="atenciones"
        limit={10}
      />

      <section className="panel gold-panel">
        <header className="panel-header">
          <div>
            <h2>Fuentes de datos procesadas</h2>
            <p className="gold-subtitle">
              Las cantidades representan filas procesadas por fuente y no deben
              sumarse como si fueran personas o casos únicos.
            </p>
          </div>
        </header>
        <div className="gold-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Fuente</th>
                <th>Filas procesadas</th>
              </tr>
            </thead>
            <tbody>
              {data.calidad.fuentes.map((fuente) => (
                <tr key={fuente.nombre}>
                  <td>{fuente.nombre}</td>
                  <td>{formatNumber(fuente.filas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="gold-footer">
        STASYS · Capa GOLD · Información según las fuentes disponibles
      </footer>
    </div>
  );
}
