import './Sidebar.css';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Activity,
  Settings,
  CircleHelp,
  Headset,
  ChevronRight,
} from 'lucide-react';

const navigationItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tickets', icon: Ticket, count: 12 },
  { label: 'Agents', icon: Users },
  { label: 'Activity Logs', icon: Activity },
];

const workspaceItems = [
  { label: 'Settings', icon: Settings },
  { label: 'Help & Support', icon: CircleHelp },
];

function Sidebar({ activePage = 'Overview', onNavigate }) {
  const renderNavigation = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = activePage === item.label;

      return (
        <button
          key={item.label}
          type="button"
          className={`sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => onNavigate?.(item.label)}
        >
          <Icon size={19} strokeWidth={1.8} />

          <span>{item.label}</span>

          {item.count && (
            <span className="sidebar-count">{item.count}</span>
          )}

          {isActive && (
            <ChevronRight size={15} className="sidebar-arrow" />
          )}
        </button>
      );
    });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Headset size={25} />
        </div>

        <div className="brand-text">
          <h2>LIVE OPS</h2>
          <span>HELPDESK</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">OPERATIONS</p>
        <nav className="sidebar-navigation">
          {renderNavigation(navigationItems)}
        </nav>
      </div>

      <div className="sidebar-section workspace-section">
        <p className="sidebar-heading">WORKSPACE</p>
        <nav className="sidebar-navigation">
          {renderNavigation(workspaceItems)}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="admin-avatar">OA</div>

        <div className="admin-info">
          <strong>Operations Admin</strong>
          <span>Administrator</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
