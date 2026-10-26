export default function ActivityFeed({ items }) {
  return (
    <section className="panel activity-panel">
      <header className="panel-header">
        <h2>Actividad Reciente</h2>
        <button className="text-link" type="button">
          Ver todos
        </button>
      </header>
      <ul className="activity-list">
        {items.map((item) => (
          <li key={item.id} className={`activity-item tone-${item.tone}`}>
            <span className="activity-dot" />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
