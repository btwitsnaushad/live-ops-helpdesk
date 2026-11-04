import { useState } from 'react';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Overview from './pages/Overview';
import Tickets from './pages/Tickets';
import Agents from './pages/Agents';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';

import './App.css';

function App() {
  const [activePage, setActivePage] = useState('Overview');

  const renderPage = () => {
    switch (activePage) {
      case 'Overview':
        return <Overview />;

      case 'Tickets':
        return <Tickets />;

      case 'Agents':
        return <Agents />;

      case 'Activity Logs':
        return <ActivityLogs />;

      case 'Settings':
        return <Settings />;

      default:
        return <Overview />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-content">
        <Topbar />
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
