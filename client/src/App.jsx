import Sidebar from './components/Sidebar';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Headphones,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  Zap,
} from 'lucide-react'

import './App.css'

const tickets = [
  {
    id: '#TK-2048',
    customer: 'Olivia Martin',
    initials: 'OM',
    subject: 'Unable to access my account',
    priority: 'High',
    status: 'Open',
    agent: 'Aarav Roy',
    time: '5 min ago',
  },
  {
    id: '#TK-2047',
    customer: 'Ethan Walker',
    initials: 'EW',
    subject: 'Payment confirmation missing',
    priority: 'Medium',
    status: 'In Progress',
    agent: 'Priya Sharma',
    time: '12 min ago',
  },
  {
    id: '#TK-2046',
    customer: 'Sophia Chen',
    initials: 'SC',
    subject: 'Order status has not updated',
    priority: 'High',
    status: 'Resolved',
    agent: 'Dev Kumar',
    time: '28 min ago',
  },
  {
    id: '#TK-2045',
    customer: 'Noah Patel',
    initials: 'NP',
    subject: 'Request to update account details',
    priority: 'Low',
    status: 'Open',
    agent: 'Meera Singh',
    time: '34 min ago',
  },
]

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Tickets', icon: Ticket, count: '12' },
  { label: 'Agents', icon: Users },
  { label: 'Activity Logs', icon: Activity },
]

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  detail,
  trend,
}) {
  return (
    <article className="stat-card">
      <div className="stat-heading">
        <span className={`stat-icon ${color}`}>
          <Icon size={21} />
        </span>

        <span className="stat-title">{title}</span>

        <button className="icon-button" aria-label={`More about ${title}`}>
          <MoreHorizontal size={19} />
        </button>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend === 'up' && <ArrowUpRight size={17} />}
        {trend === 'down' && <ArrowDownRight size={17} />}

        <span className={trend === 'neutral' ? 'muted' : 'trend-positive'}>
          {detail}
        </span>
      </div>
    </article>
  )
}

function TicketVolumeChart() {
  const points = [
    [20, 120],
    [85, 115],
    [150, 85],
    [215, 95],
    [280, 52],
    [345, 66],
    [410, 24],
    [475, 43],
  ]

  const line = points.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `20,145 ${line} 475,145`

  return (
    <svg
      className="volume-chart"
      viewBox="0 0 495 165"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative ticket volume chart"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3999ff" stopOpacity=".30" />
          <stop offset="100%" stopColor="#3999ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[25, 55, 85, 115, 145].map((y) => (
        <line
          key={y}
          x1="20"
          y1={y}
          x2="475"
          y2={y}
          className="chart-grid"
        />
      ))}

      <polygon points={area} fill="url(#chartFill)" />

      <polyline
        points={line}
        fill="none"
        stroke="#42a5ff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map(([x, y]) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="4"
          fill="#42a5ff"
          stroke="#e8f4ff"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview">
        <span className="brand-mark">
          <Headphones size={26} />
        </span>

        <span className="brand-copy">
          <strong>LIVE OPS</strong>
          <span>HELPDESK</span>
        </span>
      </a>

      <div className="nav-section-label">OPERATIONS</div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, count }, index) => (
          <a
            href={
              index === 0
                ? '#overview'
                : `#${label.toLowerCase().replaceAll(' ', '-')}`
            }
            className={`nav-link ${index === 0 ? 'active' : ''}`}
            key={label}
          >
            <Icon size={19} />
            <span>{label}</span>
            {count && <span className="nav-count">{count}</span>}
          </a>
        ))}
      </nav>

      <div className="nav-divider" />

      <div className="nav-section-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        <a className="nav-link" href="#settings">
          <Settings size={19} />
          <span>Settings</span>
        </a>

        <a className="nav-link" href="#help">
          <CircleHelp size={19} />
          <span>Help & Support</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="admin-avatar">OA</div>

        <div className="admin-info">
          <strong>Operations Admin</strong>
          <span>Workspace Admin</span>
        </div>

        <button className="icon-button" aria-label="Account options">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </aside>
  )
}

function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <div className="system-status">
              <span className="status-dot" />
              All systems operational
            </div>

            <button className="date-button">
              <CalendarDays size={17} />
              Last 24 hours
              <ChevronDown size={16} />
            </button>

            <button className="notification-button" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>

            <button
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => document.body.classList.toggle('menu-open')}
            >
              <Menu size={21} />
            </button>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              SUPPORT OPERATIONS
            </div>

            <h1>Operations Overview</h1>

            <p>
              Monitor support activity and agent performance in one place.
            </p>
          </div>

          <div className="live-indicator">
            <span className="status-dot" />
            Live monitoring
          </div>
        </section>

        <section className="stats-grid" aria-label="Key performance indicators">
          <StatCard
            title="Total Tickets"
            value="248"
            icon={Ticket}
            color="blue"
            detail="12.8% vs previous period"
            trend="up"
          />

          <StatCard
            title="Open Tickets"
            value="36"
            icon={Clock3}
            color="amber"
            detail="Needs attention"
            trend="neutral"
          />

          <StatCard
            title="Active Agents"
            value="12"
            icon={Users}
            color="cyan"
            detail="10 agents available"
            trend="neutral"
          />

          <StatCard
            title="Avg. First Response"
            value="2m 34s"
            icon={Zap}
            color="green"
            detail="8.4% faster than before"
            trend="down"
          />
        </section>

        <section className="analytics-grid">
          <article className="panel volume-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">
                  <Activity size={20} />
                </span>
                <div>
                  <h2>Ticket Volume</h2>
                  <p>Support requests over time</p>
                </div>
              </div>

              <div className="chart-filters">
                <button className="selected">24H</button>
                <button>7D</button>
                <button>30D</button>
              </div>
            </div>

            <div className="chart-labels">
              <span>60</span>
              <span>45</span>
              <span>30</span>
              <span>15</span>
              <span>0</span>
            </div>

            <TicketVolumeChart />

            <div className="chart-times">
              <span>12 AM</span>
              <span>3 AM</span>
              <span>6 AM</span>
              <span>9 AM</span>
              <span>12 PM</span>
              <span>3 PM</span>
              <span>6 PM</span>
              <span>9 PM</span>
            </div>
          </article>

          <article className="panel availability-panel" id="agents">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">
                  <Users size={20} />
                </span>
                <div>
                  <h2>Agent Availability</h2>
                  <p>Current team status</p>
                </div>
              </div>
            </div>

            <div className="availability-content">
              <div className="donut-wrap">
                <div className="donut">
                  <div className="donut-center">
                    <strong>16</strong>
                    <span>Total agents</span>
                  </div>
                </div>
              </div>

              <div className="availability-legend">
                <div>
                  <span className="legend-label">
                    <i className="legend-dot available" />
                    Available
                  </span>
                  <strong>10</strong>
                </div>

                <div>
                  <span className="legend-label">
                    <i className="legend-dot busy" />
                    On a ticket
                  </span>
                  <strong>2</strong>
                </div>

                <div>
                  <span className="legend-label">
                    <i className="legend-dot offline" />
                    Offline
                  </span>
                  <strong>4</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="panel tickets-panel" id="tickets">
          <div className="panel-header tickets-heading">
            <div className="panel-title">
              <span className="panel-icon">
                <Ticket size={20} />
              </span>

              <div>
                <h2>Recent Tickets</h2>
                <p>Your latest customer support activity</p>
              </div>
            </div>

            <a href="#all-tickets" className="view-all">
              View all tickets <span>→</span>
            </a>
          </div>

          <div className="table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <span className="ticket-id">{ticket.id}</span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <span className="person-avatar">
                          {ticket.initials}
                        </span>
                        <span>{ticket.customer}</span>
                      </div>
                    </td>

                    <td className="subject-cell">{ticket.subject}</td>

                    <td>
                      <span
                        className={`badge priority-${ticket.priority.toLowerCase()}`}
                      >
                        <i />
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge status-${ticket.status
                          .toLowerCase()
                          .replaceAll(' ', '-')}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>{ticket.agent}</td>

                    <td className="updated-cell">{ticket.time}</td>

                    <td>
                      <button
                        className="icon-button row-action"
                        aria-label={`Options for ${ticket.id}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            <span>Showing 4 sample tickets</span>
            <span className="footer-secure">
              <ShieldCheck size={15} />
              Live Ops Workspace
              <CheckCircle2 size={15} />
            </span>
          </div>
        </section>

        <footer className="app-footer">
          <span>Live Ops Helpdesk</span>
          <span>Operations workspace</span>
        </footer>
      </main>
    </div>
  )
}

export default App