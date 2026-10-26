export default function CasesByType({ data, maxValue }) {
  return (
    <section className="panel type-panel">
      <header className="panel-header">
        <h2>Casos por Tipo</h2>
      </header>
      <ul className="type-list">
        {data.map(({ type, value }) => (
          <li key={type}>
            <span className="type-label">{type}</span>
            <div className="type-track">
              <div
                className="type-fill"
                style={{ width: `${(value / maxValue) * 100}%` }}
                title={`${type}: ${value.toLocaleString('es-PE')}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
