const {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks
} = require('./ticketStore');

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Agent connected: ${socket.id}`);

    socket.on('join_dashboard', () => {
      socket.emit('dashboard_state', {
        tickets: getTickets(),
        locks: serializeLocks()
      });
    });

    socket.on('create_ticket', ({ truckId, issue }) => {
      if (!truckId || !issue) return;
      const newTicket = addTicket(truckId, issue);
      io.emit('ticket_created', newTicket);
    });

    socket.on('lock_ticket', ({ ticketId, agentName }) => {
      const existingLock = activeLocks.get(ticketId);

      // Prevent lock override if another agent is already editing
      if (existingLock && existingLock.socketId !== socket.id) {
        socket.emit('lock_rejected', {
          ticketId,
          lockedBy: existingLock.agentName
        });
        return;
      }

      activeLocks.set(ticketId, {
        socketId: socket.id,
        agentName: agentName || 'Support Agent',
        lockedAt: Date.now()
      });

      io.emit('locks_updated', serializeLocks());
    });

    socket.on('unlock_ticket', ({ ticketId, resolution, status }) => {
      const existingLock = activeLocks.get(ticketId);

      // Only the lock holder can save or release the ticket
      if (!existingLock || existingLock.socketId !== socket.id) return;

      if (typeof resolution === 'string') {
        const updatedTickets = updateTicketResolution(ticketId, resolution, status);
        io.emit('tickets_updated', updatedTickets);
      }

      activeLocks.delete(ticketId);
      io.emit('locks_updated', serializeLocks());
    });

    // Release locks automatically if an agent closes their tab or loses network
    socket.on('disconnect', () => {
      let lockReleased = false;

      for (const [ticketId, lock] of activeLocks.entries()) {
        if (lock.socketId === socket.id) {
          activeLocks.delete(ticketId);
          lockReleased = true;
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