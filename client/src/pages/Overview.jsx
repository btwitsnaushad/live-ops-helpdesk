
import {
  Ticket,
  Clock,
  Users,
  Zap,
  Activity,
} from 'lucide-react';

import StatCard from '../components/StatCard';
import TicketVolumeChart from '../components/TicketVolumeChart';
import AgentAvailability from '../components/AgentAvailability';
import RecentTickets from '../components/RecentTickets';

import useDashboard from '../hooks/useDashboard';

const iconMap = {
  Ticket,
  Clock,
  Users,
  Zap,
};

function Overview() {
  const {
    dashboardStats,
    chartData,
    recentTickets,
    agentSummary,
    dashboardFilters,
    selectedFilter,
    setSelectedFilter,
  } = useDashboard();

  return (
    <section className="overview-page">

      {/* Dashboard heading */}
      <header className="overview-header">
        <div className="overview-heading">
          <div className="overview-heading-icon">
            <Activity size={20} />
          </div>

          <div>
            <span className="overview-eyebrow">
              LIVE OPERATIONS
            </span>

            <h1>Operations Overview</h1>

            <p>
              Monitor support activity and agent performance in real time.
            </p>
          </div>
        </div>
      </header>

      {/* Summary cards */}
      <div className="overview-stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={iconMap[stat.icon]}
            color={stat.color}
            trend={
              stat.change !== undefined && stat.change !== null
                ? Number.parseFloat(stat.change)
                : undefined
            }
            trendLabel={stat.description}
          />
        ))}
      </div>

      {/* Analytics section */}
      <div className="overview-analytics-grid">

        <div className="overview-chart-section">
          <TicketVolumeChart
            data={chartData}
            filters={dashboardFilters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        <div className="overview-agent-section">
          <AgentAvailability agents={agentSummary} />
        </div>

      </div>

      {/* Recent tickets */}
      <section className="overview-recent-section">
        <RecentTickets tickets={recentTickets} />
      </section>

    </section>
  );
}

export default Overview;
