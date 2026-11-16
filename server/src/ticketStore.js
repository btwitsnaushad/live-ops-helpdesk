
const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved'];

// Initial dispatch tickets available when the server starts.
let tickets = [
  {
    id: 'TKT-101',
    truckId: 'TX-9982',
    issue: 'Alternator failure on I-35 North near Waco',
    status: 'Open',
    resolution: '',
  },
  {
    id: 'TKT-105',
    truckId: 'DAL-4410',
    issue: 'Missed dock appointment at Dallas distribution hub',
    status: 'Open',
    resolution: '',
  },
  {
    id: 'TKT-109',
    truckId: 'HOU-7721',
    issue: 'Reefer unit temperature variance alert (+8°F)',
    status: 'Open',
    resolution: '',
  },
];

// Store active ticket locks using ticketId as the key.
const activeLocks = new Map();

// Generate a unique ID for each newly created ticket.
const generateTicketId = () => {
  let ticketId;

  do {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000);

    ticketId = `TKT-${timestamp}-${randomNumber}`;
  } while (tickets.some((ticket) => ticket.id === ticketId));

  return ticketId;
};

// Return a copy of the current ticket list.
const getTickets = () => {
  return tickets.map((ticket) => ({ ...ticket }));
};

// Create a new dispatch ticket.
const addTicket = (truckId, issue) => {
  if (
    typeof truckId !== 'string' ||
    typeof issue !== 'string' ||
    !truckId.trim() ||
    !issue.trim()
  ) {
    throw new Error('Truck ID and issue are required.');
  }

  const newTicket = {
    id: generateTicketId(),
    truckId: truckId.trim().toUpperCase(),
    issue: issue.trim(),
    status: 'Open',
    resolution: '',
  };

  tickets.unshift(newTicket);

  return { ...newTicket };
};

// Update a ticket's resolution and status.
const updateTicketResolution = (
  ticketId,
  resolution,
  status = 'Resolved'
) => {
  if (
    typeof ticketId !== 'string' ||
    !ticketId.trim() ||
    typeof resolution !== 'string' ||
    !resolution.trim()
  ) {
    throw new Error('Valid ticket ID and resolution are required.');
  }

  const ticketIndex = tickets.findIndex(
    (ticket) => ticket.id === ticketId
  );

  if (ticketIndex === -1) {
    throw new Error('Ticket not found.');
  }

  const updatedStatus = ALLOWED_STATUSES.includes(status)
    ? status
    : 'Resolved';

  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    resolution: resolution.trim(),
    status: updatedStatus,
  };

  return getTickets();
};

// Convert the active lock Map into a plain object for Socket.IO.
const serializeLocks = () => {
  return Object.fromEntries(
    Array.from(activeLocks.entries()).map(([ticketId, lock]) => [
      ticketId,
      { ...lock },
    ])
  );
};

module.exports = {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks,
};
