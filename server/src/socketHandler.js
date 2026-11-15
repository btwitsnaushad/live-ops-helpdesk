const {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks
} = require('./ticketStore');

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved'];

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Agent connected: ${socket.id}`);

    // Send the latest dashboard data to the connected agent
    socket.on('join_dashboard', () => {
      socket.emit('dashboard_state', {
        tickets: getTickets(),
        locks: serializeLocks()
      });
    });

    // Create a new dispatch ticket
    socket.on('create_ticket', (data = {}) => {
      const { truckId, issue } = data;

      if (
        typeof truckId !== 'string' ||
        typeof issue !== 'string' ||
        !truckId.trim() ||
        !issue.trim()
      ) {
        socket.emit('ticket_error', {
          message: 'Truck ID and issue are required.'
        });
        return;
      }

      const newTicket = addTicket(truckId, issue);

      // Broadcast the new ticket to all connected agents
      io.emit('ticket_created', newTicket);
    });

    // Lock a ticket for editing
    socket.on('lock_ticket', (data = {}) => {
      const { ticketId, agentName } = data;

      if (typeof ticketId !== 'string' || !ticketId.trim()) {
        return;
      }

      const ticketExists = getTickets().some(
        (ticket) => ticket.id === ticketId
      );

      if (!ticketExists) {
        socket.emit('lock_rejected', {
          ticketId,
          message: 'Ticket not found.'
        });
        return;
      }

      const existingLock = activeLocks.get(ticketId);

      // Do not allow another agent to take an existing lock
      if (existingLock && existingLock.socketId !== socket.id) {
        socket.emit('lock_rejected', {
          ticketId,
          lockedBy: existingLock.agentName,
          message: 'This ticket is already locked.'
        });
        return;
      }

      activeLocks.set(ticketId, {
        socketId: socket.id,
        agentName:
          typeof agentName === 'string' && agentName.trim()
            ? agentName.trim()
            : 'Support Agent',
        lockedAt: Date.now()
      });

      // Update the lock status for all connected agents
      io.emit('locks_updated', serializeLocks());

      // Confirm the lock to the requesting agent
      socket.emit('lock_granted', { ticketId });
    });

    // Save changes and release the ticket lock
    socket.on('unlock_ticket', (data = {}) => {
      const { ticketId, resolution, status } = data;

      if (typeof ticketId !== 'string' || !ticketId.trim()) {
        return;
      }

      const existingLock = activeLocks.get(ticketId);

      // Only the agent holding the lock can release it
      if (!existingLock || existingLock.socketId !== socket.id) {
        return;
      }

      // Save the resolution only when a non-empty value is provided
      if (typeof resolution === 'string' && resolution.trim()) {
        const selectedStatus = ALLOWED_STATUSES.includes(status)
          ? status
          : 'Resolved';

        const updatedTickets = updateTicketResolution(
          ticketId,
          resolution,
          selectedStatus
        );

        // Broadcast updated tickets to all connected agents
        io.emit('tickets_updated', updatedTickets);
      }

      // Release the ticket lock
      activeLocks.delete(ticketId);

      io.emit('locks_updated', serializeLocks());
    });

    // Automatically release all locks when an agent disconnects
    socket.on('disconnect', () => {
      let lockReleased = false;

      for (const [ticketId, lock] of activeLocks.entries()) {
        if (lock.socketId === socket.id) {
          activeLocks.delete(ticketId);
          lockReleased = true;

          console.log(`Released lock for ticket: ${ticketId}`);
        }
      }

      if (lockReleased) {
        io.emit('locks_updated', serializeLocks());
      }

      console.log(`Agent disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
