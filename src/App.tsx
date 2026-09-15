import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
import { PatternBackground } from './components/layout/PatternBackground';
import { Header } from './components/layout/Header';
import { GlobalFilterBar } from './components/layout/GlobalFilterBar';
import { DrilldownModal } from './components/ui/DrilldownModal';
import { Dashboard } from './pages/Dashboard';
import { HubPage } from './pages/HubPage';
import { DrilldownPage } from './pages/DrilldownPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDrilldownPage = location.pathname.startsWith('/drilldown');
  const isHubPage = location.pathname.startsWith('/hub/');

  return (
    <PatternBackground>
      <Header />
      {!isDrilldownPage && <GlobalFilterBar hideHubSelector={isHubPage} />}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-6 py-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hub/:hubName" element={<HubPage />} />
          <Route path="/drilldown" element={<DrilldownPage />} />
        </Routes>
      </main>
      <DrilldownModal />
    </PatternBackground>
  );
};

export const App: React.FC = () => {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </DataProvider>
  );
};

export default App;
