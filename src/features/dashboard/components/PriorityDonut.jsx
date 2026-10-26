import AnimatedNumber from './AnimatedNumber.jsx';

const RADIUS = 70;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PriorityDonut({ data, total }) {
  let offset = 0;
  const segments = data.map((item) => {
    const length = (item.share / 100) * CIRCUMFERENCE;
    const segment = { ...item, length, offset };
    offset += length;
    return segment;
  });

  return (
    <section className="panel donut-panel">
      <header className="panel-header">
        <h2>Distribución por prioridad</h2>
      </header>
      <div className="donut-layout">
        <svg
          className="donut-svg"
          viewBox="0 0 200 200"
          role="img"
          aria-label={`Distribución por prioridad. Total ${total.toLocaleString('es-PE')} casos`}
        >
          <g transform="rotate(-90 100 100)">
            {segments.map((segment, index) => (
              <circle
                key={segment.key}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE}
                strokeDashoffset={-segment.offset}
                strokeLinecap="butt"
                className="donut-segment"
                style={{
                  '--segment-length': segment.length,
                  '--segment-gap': CIRCUMFERENCE - segment.length,
                  '--circumference': CIRCUMFERENCE,
                  animationDelay: `${index * 110}ms`,
                }}
              />
            ))}
          </g>
          <text x="100" y="96" className="donut-total" textAnchor="middle">
            <AnimatedNumber key={total} value={total} />
          </text>
          <text x="100" y="116" className="donut-caption" textAnchor="middle">
            casos
          </text>
        </svg>
        <ul className="donut-legend">
          {data.map((item) => (
            <li key={item.key}>
              <span className="legend-dot" style={{ background: item.color }} />
              <span className="legend-label">{item.label}</span>
              <strong>
                <AnimatedNumber key={item.value} value={item.value} />
                <span className="legend-share">
                  {' '}
                  (<AnimatedNumber key={item.share} value={item.share} decimals={1} />
                  %)
                </span>
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
