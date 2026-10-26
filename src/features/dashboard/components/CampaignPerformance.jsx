const number = new Intl.NumberFormat('es-PE');

const statusOf = (pct) => {
  if (pct >= 88) return { label: 'En meta', className: 'status-closed' };
  if (pct >= 75) return { label: 'En riesgo', className: 'status-review' };
  return { label: 'Crítico', className: 'status-critical' };
};

function buildRows(data) {
  const totalMeta = data.reduce((sum, item) => sum + item.meta, 0);
  const totalCerrados = data.reduce((sum, item) => sum + item.cerrados, 0);

  return {
    totalMeta,
    totalCerrados,
    rows: data.map((item) => {
      const pct = (item.cerrados / item.meta) * 100;
      const prevPct = (item.cerradosPrev / item.meta) * 100;
      return {
        ...item,
        pct,
        prevPct,
        delta: pct - prevPct,
        brecha: item.meta - item.cerrados,
        status: statusOf(pct),
      };
    }),
  };
}

export default function CampaignPerformance({ data }) {
  const { totalMeta, totalCerrados, rows } = buildRows(data);
  const globalPct = (totalCerrados / totalMeta) * 100;
  const maxPct = 100;

  return (
    <section className="panel campaign-panel">
      <header className="panel-header">
        <div>
          <h2>Cumplimiento de Metas de Cierre por Región</h2>
          <p className="panel-subtitle">
            ¿Qué regiones están en riesgo de no cumplir su meta semestral de
            cierre de casos?
          </p>
        </div>
        <span className="campaign-global">
          Global {globalPct.toFixed(0)}%
        </span>
      </header>

      <div className="campaign-body">
        <ul className="campaign-bars">
          {rows.map((row) => (
            <li key={row.region}>
              <span className="campaign-region">{row.region}</span>
              <div
                className="campaign-track"
                title={`${row.region}: ${number.format(row.cerrados)} de ${number.format(row.meta)} casos (${row.pct.toFixed(0)}%)`}
              >
                <div
                  className={`campaign-fill campaign-${row.status.className.replace('status-', '')}`}
                  style={{ width: `${Math.min(row.pct, maxPct)}%` }}
                />
                <span className="campaign-marker" aria-hidden="true" />
              </div>
              <span className={`campaign-pct campaign-pct-${row.status.className.replace('status-', '')}`}>
                {row.pct.toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>

        <table className="orders-table campaign-table">
          <thead>
            <tr>
              <th>Región</th>
              <th>Meta</th>
              <th>Cerrados</th>
              <th>Pendiente</th>
              <th>Δ vs. periodo ant.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.region}>
                <td>{row.region}</td>
                <td className="mono">{number.format(row.meta)}</td>
                <td className="mono">{number.format(row.cerrados)}</td>
                <td className="mono">{number.format(row.brecha)}</td>
                <td>
                  <span className={row.delta >= 0 ? 'delta-up' : 'delta-down'}>
                    {row.delta >= 0 ? '▲' : '▼'} {Math.abs(row.delta).toFixed(0)} pp
                  </span>
                </td>
                <td>
                  <span className={`status ${row.status.className}`}>
                    {row.status.label}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="campaign-total-row">
              <td>Total</td>
              <td className="mono">{number.format(totalMeta)}</td>
              <td className="mono">{number.format(totalCerrados)}</td>
              <td className="mono">{number.format(totalMeta - totalCerrados)}</td>
              <td>—</td>
              <td>
                <span className={`status ${statusOf(globalPct).className}`}>
                  {statusOf(globalPct).label}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
