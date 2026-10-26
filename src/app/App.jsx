
import { useState } from 'react';

import Header from './layout/Header.jsx';
import SideBar from './layout/SideBar.jsx';

import DashboardPage from '../features/dashboard/pages/DashboardPage.jsx';
import AssistencialPage from '../features/dashboard/pages/AssistencialPage.jsx';
import RenipressPage from '../features/dashboard/pages/RenipressPage.jsx';

import AssistantPage from '../features/assistant/pages/AssistantPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Inicio');

  function navigateToPage(page) {
    const allowedPages = [
      'Inicio',
      'Producción Asistencial',
      'IPRESS',
    ];

    if (allowedPages.includes(page)) {
      setCurrentPage(page);
    }
  }

  function renderPage() {
    switch (currentPage) {
      case 'Producción Asistencial':
        return <AssistencialPage />;

      case 'IPRESS':
        return <RenipressPage />;

      case 'Inicio':
      default:
        return <DashboardPage />;
    }
  }

  return (
    <div className="app-shell">
      <SideBar
        activePage={currentPage}
        onNavigate={navigateToPage}
      />

      <div className="content-area">
        <Header />

        <main className="page-content">
          {renderPage()}
        </main>
      </div>

      <AssistantPage />
    </div>
  );
}
