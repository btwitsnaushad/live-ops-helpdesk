
 // Dashboard summary cards
export const dashboardStats = [
  {
    id: 1,
    title: 'Total Tickets',
    value: 248,
    change: '+12.8%',
    description: 'vs previous period',
    icon: 'Ticket',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Open Tickets',
    value: 36,
    change: null,
    description: 'Needs attention',
    icon: 'Clock',
    color: 'amber',
  },
  {
    id: 3,
    title: 'Active Agents',
    value: 6,
    change: null,
    description: '3 agents available',
    icon: 'Users',
    color: 'cyan',
  },
  {
    id: 4,
    title: 'Avg. First Response',
    value: '2m 34s',
    change: '8.4%',
    description: 'Faster than before',
    icon: 'Zap',
    color: 'green',
  },
];

// Ticket volume chart data
export const ticketVolumeData = {
  '24H': [
    { label: '12 AM', tickets: 12 },
    { label: '3 AM', tickets: 15 },
    { label: '6 AM', tickets: 30 },
    { label: '9 AM', tickets: 25 },
    { label: '12 PM', tickets: 47 },
    { label: '3 PM', tickets: 39 },
    { label: '6 PM', tickets: 62 },
    { label: '9 PM', tickets: 52 },
  ],

  '7D': [
    { label: 'Mon', tickets: 35 },
    { label: 'Tue', tickets: 42 },
    { label: 'Wed', tickets: 38 },
    { label: 'Thu', tickets: 55 },
    { label: 'Fri', tickets: 48 },
    { label: 'Sat', tickets: 65 },
    { label: 'Sun', tickets: 52 },
  ],

  '30D': [
    { label: 'Week 1', tickets: 180 },
    { label: 'Week 2', tickets: 220 },
    { label: 'Week 3', tickets: 195 },
    { label: 'Week 4', tickets: 248 },
  ],
};

// Agent availability summary
export const agentAvailability = {
  total: 6,
  available: 3,
  onTicket: 1,
  offline: 2,
};

// Dashboard time filters
export const dashboardFilters = [
  { label: 'Last 24 hours', value: '24H' },
  { label: 'Last 7 days', value: '7D' },
  { label: 'Last 30 days', value: '30D' },
];
