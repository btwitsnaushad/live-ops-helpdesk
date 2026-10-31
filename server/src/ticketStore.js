// Initial dispatch tickets
let tickets = [
  {
    id: 'TKT-101',
    truckId: 'TX-9982',
    issue: 'Alternator failure on I-35 North near Waco',
    status: 'Open',
    resolution: ''
  },
  {
    id: 'TKT-105',
    truckId: 'DAL-4410',
    issue: 'Missed dock appointment at Dallas distribution hub',
    status: 'Open',
    resolution: ''
  },
  {
    id: 'TKT-109',
    truckId: 'HOU-7721',
    issue: 'Reefer unit temperature variance alert (+8°F)',
    status: 'Open',
    resolution: ''
  }
];

// In-memory lock store: ticketId -> { socketId, agentName, lockedAt }
const activeLocks = new Map();

const getTickets = () => tickets;

const addTicket = (truckId, issue) => {
  const newTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    truckId: truckId.trim().toUpperCase(),
    issue: issue.trim(),
    status: 'Open',
    resolution: ''
  };
  tickets.unshift(newTicket);
  return newTicket;
};

const updateTicketResolution = (ticketId, resolution, status = 'Resolved') => {
  tickets = tickets.map((t) =>
    t.id === ticketId ? { ...t, resolution: resolution.trim(), status } : t
  );
  return tickets;
};

const serializeLocks = () => Object.fromEntries(activeLocks);

module.exports = {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks
};