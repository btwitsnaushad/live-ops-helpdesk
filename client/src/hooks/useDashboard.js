import { useMemo, useState } from 'react';

import {
  dashboardStats,
  ticketVolumeData,
  agentAvailability,
  dashboardFilters,
} from '../data/dashboardData';

import { sampleTickets } from '../data/sampleTickets';
import { sampleAgents } from '../data/sampleAgents';

function useDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('24H');

  const chartData = useMemo(() => {
    return ticketVolumeData[selectedFilter] || ticketVolumeData['24H'];
  }, [selectedFilter]);

  const recentTickets = useMemo(() => {
    return [...sampleTickets]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 4);
  }, []);

  const agentSummary = useMemo(() => {
    return {
      ...agentAvailability,
      totalSampleAgents: sampleAgents.length,
    };
  }, []);

  return {
    dashboardStats,
    chartData,
    recentTickets,
    sampleAgents,
    agentSummary,
    dashboardFilters,
    selectedFilter,
    setSelectedFilter,
  };
}

export default useDashboard;
