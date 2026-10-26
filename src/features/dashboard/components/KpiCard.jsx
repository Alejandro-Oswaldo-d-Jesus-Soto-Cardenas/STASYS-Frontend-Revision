import AnimatedNumber from './AnimatedNumber.jsx';

export default function KpiCard({ label, value, icon: Icon, tone = 'red' }) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-icon">{Icon ? <Icon size={22} strokeWidth={2.2} /> : null}</div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value"><AnimatedNumber key={value} value={value} /></strong>
      </div>
    </article>
  );
}
