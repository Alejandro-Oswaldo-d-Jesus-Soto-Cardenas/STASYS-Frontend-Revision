import AnimatedNumber from './AnimatedNumber.jsx';

const Y_TICKS = [1000, 800, 600, 400, 200, 0];
const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 16, right: 12, bottom: 32, left: 40 };

function toPoints(data) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const max = 1000;

  return data.map((item, index) => {
    const x =
      PAD.left + (data.length === 1 ? innerW / 2 : (index / (data.length - 1)) * innerW);
    const y = PAD.top + innerH - (item.cases / max) * innerH;
    return { ...item, x, y };
  });
}

export default function CasesTrendChart({ data }) {
  const points = toPoints(data);
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = [
    `${PAD.left},${HEIGHT - PAD.bottom}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${WIDTH - PAD.right},${HEIGHT - PAD.bottom}`,
  ].join(' ');

  return (
    <section className="panel chart-panel">
      <header className="panel-header">
        <h2>Evolución de Casos</h2>
      </header>
      <svg
        className="trend-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Evolución de casos en los últimos 12 meses"
      >
        {Y_TICKS.map((tick) => {
          const y =
            PAD.top +
            ((HEIGHT - PAD.top - PAD.bottom) * (1000 - tick)) / 1000;
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                className="chart-grid"
              />
              <text x={PAD.left - 8} y={y + 4} className="chart-axis" textAnchor="end">
                <AnimatedNumber key={tick} value={tick} />
              </text>
            </g>
          );
        })}
        <polygon points={area} className="chart-area" />
        <polyline points={polyline} className="chart-line" pathLength="1" />
        {points.map((p, index) => (
          <g key={p.month}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              className="chart-dot"
              style={{ animationDelay: `${index * 65}ms` }}
            >
              <title>{p.month}: <AnimatedNumber key={p.month} value={p.cases} /> casos</title>
            </circle>
            <text x={p.x} y={HEIGHT - 8} className="chart-axis" textAnchor="middle">
              {p.month}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
