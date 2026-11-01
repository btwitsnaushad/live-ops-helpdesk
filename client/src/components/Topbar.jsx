
import {
  CalendarDays,
  ChevronDown,
  Bell,
} from 'lucide-react';

import './Topbar.css';

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>Overview</strong>
      </div>

      <div className="topbar-actions">
        <div className="system-status">
          <span className="status-dot"></span>
          All systems operational
        </div>

        <button className="date-button" type="button">
          <CalendarDays size={16} />
          <span>Last 24 hours</span>
          <ChevronDown size={15} />
        </button>

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
