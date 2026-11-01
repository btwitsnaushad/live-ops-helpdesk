import {
  Ticket,
  Clock,
  Users,
  Zap,
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
    <div className="overview-page">

      {/* Dashboard heading */}
      <div className="overview-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Monitor your support operations at a glance.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={iconMap[stat.icon]}
            color={stat.color}
            trend={
              stat.change
                ? Number.parseFloat(stat.change)
                : undefined
            }
            trendLabel={stat.description}
          />
        ))}
      </div>

      {/* Charts and agent availability */}
      <div className="overview-analytics">
        <TicketVolumeChart
          data={chartData}
          filters={dashboardFilters}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <AgentAvailability agents={agentSummary} />
      </div>

      {/* Recent tickets */}
      <div className="overview-tickets">
        <RecentTickets tickets={recentTickets} />
      </div>

    </div>
  );
}

export default Overview;
