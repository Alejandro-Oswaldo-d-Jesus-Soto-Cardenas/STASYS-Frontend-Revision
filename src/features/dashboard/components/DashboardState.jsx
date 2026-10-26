import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';

export default function DashboardState({ status, error, retry }) {
  const loading = status === 'loading';
  const failed = status === 'error';
  const Icon = loading ? LoaderCircle : failed ? AlertTriangle : Inbox;
  return (
    <section className={`panel dashboard-state state-${status}`} role={failed ? 'alert' : 'status'} aria-live="polite" aria-busy={loading}>
      <Icon size={36} className={loading ? 'state-spinner' : ''} aria-hidden="true" />
      <h2>{loading ? 'Cargando información' : failed ? 'No pudimos cargar el dashboard' : 'No hay registros disponibles'}</h2>
      <p>{loading ? 'Estamos consultando los datos. Espera un momento.' : failed ? error : 'La consulta no devolvió registros. Puedes volver a consultar más tarde.'}</p>
      {failed && <p>Comprueba tu conexión e inténtalo nuevamente.</p>}
      {!loading && <button className="state-button" type="button" onClick={retry}>{failed ? 'Reintentar' : 'Volver a consultar'}</button>}
    </section>
  );
}
