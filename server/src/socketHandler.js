
const {
  activeLocks,
  getTickets,
  addTicket,
  updateTicketResolution,
  serializeLocks,
} = require('./ticketStore');

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved'];

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Agent connected: ${socket.id}`);

    // Send the current tickets and lock information to a new agent.
    socket.on('join_dashboard', () => {
      socket.emit('dashboard_state', {
        tickets: getTickets(),
        locks: serializeLocks(),
      });
    });

    // Create a new dispatch ticket and share it with all agents.
    socket.on('create_ticket', (data = {}) => {
      const payload =
        data && typeof data === 'object' ? data : {};

      const { truckId, issue } = payload;

      if (
        typeof truckId !== 'string' ||
        typeof issue !== 'string' ||
        !truckId.trim() ||
        !issue.trim()
      ) {
        socket.emit('ticket_error', {
          message: 'Truck ID and issue are required.',
        });
        return;
      }

      try {
        const newTicket = addTicket(
          truckId.trim(),
          issue.trim()
        );

        // Make the new ticket appear immediately on every connected dashboard.
        io.emit('ticket_created', newTicket);
      } catch (error) {
        console.error('Ticket creation failed:', error.message);

        socket.emit('ticket_error', {
          message: 'Unable to create ticket. Please try again.',
        });
      }
    });

    // Give one agent exclusive editing access to a ticket.
    socket.on('lock_ticket', (data = {}) => {
      const payload =
        data && typeof data === 'object' ? data : {};

      const { ticketId, agentName } = payload;

      if (typeof ticketId !== 'string' || !ticketId.trim()) {
        socket.emit('lock_rejected', {
          message: 'A valid ticket ID is required.',
        });
        return;
      }

      const requestedTicketId = ticketId.trim();

      const ticketExists = getTickets().some(
        (ticket) => ticket.id === requestedTicketId
      );

      if (!ticketExists) {
        socket.emit('lock_rejected', {
          ticketId: requestedTicketId,
          message: 'Ticket not found.',
        });
        return;
      }

      const existingLock = activeLocks.get(requestedTicketId);

      // Prevent another agent from editing an already locked ticket.
      if (existingLock && existingLock.socketId !== socket.id) {
        socket.emit('lock_rejected', {
          ticketId: requestedTicketId,
          lockedBy: existingLock.agentName,
          message: 'This ticket is already locked.',
        });
        return;
      }

      // Avoid creating a new lock when this agent already owns it.
      if (existingLock?.socketId === socket.id) {
        socket.emit('lock_granted', {
          ticketId: requestedTicketId,
        });
        return;
      }

      const lockDetails = {
        socketId: socket.id,
        agentName:
          typeof agentName === 'string' && agentName.trim()
            ? agentName.trim()
            : 'Support Agent',
        lockedAt: Date.now(),
      };

      activeLocks.set(requestedTicketId, lockDetails);

      // Notify every connected agent about the updated lock.
      io.emit('locks_updated', serializeLocks());

      // Confirm that the requesting agent owns the lock.
      socket.emit('lock_granted', {
        ticketId: requestedTicketId,
      });
    });

    // Save ticket changes when requested and release the editing lock.
    socket.on('unlock_ticket', (data = {}) => {
      const payload =
        data && typeof data === 'object' ? data : {};

      const { ticketId, resolution, status } = payload;

      if (typeof ticketId !== 'string' || !ticketId.trim()) {
        return;
      }

      const requestedTicketId = ticketId.trim();
      const existingLock = activeLocks.get(requestedTicketId);

      // Only the agent who owns the lock can save or release the ticket.
      if (!existingLock || existingLock.socketId !== socket.id) {
        return;
      }

      // Save the resolution only when valid, non-empty text is provided.
      if (typeof resolution === 'string' && resolution.trim()) {
        const selectedStatus = ALLOWED_STATUSES.includes(status)
          ? status
          : 'Resolved';

        try {
          const updatedTickets = updateTicketResolution(
            requestedTicketId,
            resolution.trim(),
            selectedStatus
          );

          // Share the updated ticket information with all agents.
          io.emit('tickets_updated', updatedTickets);
        } catch (error) {
          console.error('Ticket update failed:', error.message);

          socket.emit('ticket_error', {
            message: 'Unable to save the ticket resolution.',
          });

          return;
        }
      }

      // Release the lock after saving or closing the editor.
      activeLocks.delete(requestedTicketId);

      io.emit('locks_updated', serializeLocks());
    });

    // Release all locks owned by an agent when their connection ends.
    socket.on('disconnect', () => {
      const releasedTicketIds = [];

      for (const [ticketId, lock] of activeLocks.entries()) {
        if (lock.socketId === socket.id) {
          activeLocks.delete(ticketId);
          releasedTicketIds.push(ticketId);
        }
      }

      // Broadcast the updated lock information when necessary.
      if (releasedTicketIds.length > 0) {
        io.emit('locks_updated', serializeLocks());

        releasedTicketIds.forEach((ticketId) => {
          console.log(`Released lock for ticket: ${ticketId}`);
        });
      }

      console.log(`Agent disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
