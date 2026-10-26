import { useState } from 'react';
import Header from './layout/Header.jsx';
import SideBar from './layout/SideBar.jsx';
import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import AssistencialPage from '../features/dashboard/pages/AssistencialPage.jsx';
import AssistantPage from '../features/assistant/pages/AssistantPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Inicio');

  function navigateToPage(page) {
    if (page === 'Inicio' || page === 'Producción Asistencial') {
      setCurrentPage(page);
    }
  }

  return (
    <div className="app-shell">
      <SideBar activePage={currentPage} onNavigate={navigateToPage} />
      <div className="content-area">
        <Header />
        <main className="page-content">
          {currentPage === 'Producción Asistencial' ? <AssistencialPage /> : <DashboardPage />}
        </main>
      </div>
      <AssistantPage />
    </div>
  );
}
