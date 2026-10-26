import { Bell, Building2, FileBarChart, FileSpreadsheet, House, Monitor } from 'lucide-react';
import stasysLogo from '../../assets/Stasys-Logo.png';

const menuItems = [
  { label: 'Inicio', icon: House, active: true },
  { label: 'Monitoreo', icon: Monitor },
  { label: 'Alertas', icon: Bell },
  { label: 'IPRESS', icon: Building2 },
  { label: 'Reportes', icon: FileBarChart },
  { label: 'Producción Asistencial', icon: FileSpreadsheet },
];

export default function SideBar({ activePage = 'Inicio', onNavigate = () => {} }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <img src={stasysLogo} alt="" />
        </div>
        <strong>STASYS</strong>
        <span>SUSALUD</span>
        <small>Sistema de Monitoreo y Análisis</small>
      </div>

      <nav className="main-nav" aria-label="Navegación principal">
        {menuItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${activePage === label ? 'active' : ''}`}
            type="button"
            aria-current={activePage === label ? 'page' : undefined}
            onClick={() => onNavigate(label)}
          >
            <Icon size={20} strokeWidth={activePage === label ? 2.4 : 2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <p className="sidebar-footer">Salud informada. Ciudadanos protegidos.</p>
    </aside>
  );
}
