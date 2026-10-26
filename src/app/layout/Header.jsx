import { Bell, Search, UserRound } from 'lucide-react';

export default function Header() {
  return (
    <header className="topbar">
      <div className="org-block">
        <strong>Superintendencia Nacional de Salud</strong>
        <span>Monitoreo · Análisis · Acción</span>
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          type="search"
          aria-label="Buscar casos, entidades o códigos"
          placeholder="Buscar casos, entidades o códigos..."
        />
      </label>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notificaciones" type="button">
          <Bell size={18} />
          <i />
        </button>

        <div className="user-chip" title="Usuario">
          <span className="avatar" aria-hidden="true">
            <UserRound size={16} />
          </span>
          <span className="user-meta">
            <strong>Usuario</strong>
            <small>User</small>
          </span>
        </div>
      </div>
    </header>
  );
}
