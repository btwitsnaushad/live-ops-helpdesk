
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

// Return all available tickets
const getTickets = () => tickets;

// Create a new ticket with a unique ID
const addTicket = (truckId, issue) => {
  let ticketId;

  do {
    ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  } while (tickets.some((ticket) => ticket.id === ticketId));

  const newTicket = {
    id: ticketId,
    truckId: truckId.trim().toUpperCase(),
    issue: issue.trim(),
    status: 'Open',
    resolution: ''
  };

  tickets.unshift(newTicket);

  return newTicket;
};

// Update ticket resolution and status
const updateTicketResolution = (ticketId, resolution, status = 'Resolved') => {
  tickets = tickets.map((ticket) =>
    ticket.id === ticketId
      ? {
          ...ticket,
          resolution: resolution.trim(),
          status
        }
      : ticket
  );

  return tickets;
};

// Convert active locks Map into a plain object
const serializeLocks = () => Object.fromEntries(activeLocks);

module.exports = {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks
};
