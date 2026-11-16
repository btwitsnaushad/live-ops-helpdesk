import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Ticket,
  Lock,
  Unlock,
  Save,
  X,
  Wifi,
  WifiOff,
} from 'lucide-react';

import socket from '../services/socket';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [locks, setLocks] = useState({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [connected, setConnected] = useState(socket.connected);
  const [notice, setNotice] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [truckId, setTruckId] = useState('');
  const [issue, setIssue] = useState('');

  const [editingTicket, setEditingTicket] = useState(null);
  const [pendingLockTicket, setPendingLockTicket] = useState(null);
  const [resolution, setResolution] = useState('');

  const pendingLockRef = useRef(null);

  const agentName = 'Support Agent';

  // Keep the pending lock reference in sync with React state.
  const updatePendingLock = (ticketId) => {
    pendingLockRef.current = ticketId;
    setPendingLockTicket(ticketId);
  };

  // Register real-time events and join the shared ticket dashboard.
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setNotice('');
      socket.emit('join_dashboard');
    };

    const handleDisconnect = () => {
      setConnected(false);
      updatePendingLock(null);
      setEditingTicket(null);
      setResolution('');
      setNotice('Connection Lost: Reconnecting...');
    };

    const handleDashboardState = (data = {}) => {
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setLocks(data.locks || {});
    };

    const handleTicketCreated = (ticket) => {
      if (!ticket?.id) return;

      setTickets((previousTickets) => [
        ticket,
        ...previousTickets.filter(
          (item) => item.id !== ticket.id
        ),
      ]);
    };

    const handleTicketsUpdated = (updatedTickets) => {
      setTickets(
        Array.isArray(updatedTickets) ? updatedTickets : []
      );
    };

    const handleLocksUpdated = (updatedLocks) => {
      const currentLocks = updatedLocks || {};

      setLocks(currentLocks);

      const pendingTicketId = pendingLockRef.current;

      // Open the editor only after the server confirms ownership.
      if (pendingTicketId) {
        const confirmedLock = currentLocks[pendingTicketId];

        if (confirmedLock?.socketId === socket.id) {
          setEditingTicket(pendingTicketId);
          setResolution('');
          updatePendingLock(null);
        }
      }
    };

    const handleLockRejected = ({ lockedBy, message } = {}) => {
      updatePendingLock(null);
      setEditingTicket(null);
      setResolution('');

      setNotice(
        message ||
          `This ticket is already locked by ${
            lockedBy || 'another agent'
          }.`
      );
    };

    const handleTicketError = ({ message } = {}) => {
      setNotice(message || 'Unable to complete the ticket request.');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('dashboard_state', handleDashboardState);
    socket.on('ticket_created', handleTicketCreated);
    socket.on('tickets_updated', handleTicketsUpdated);
    socket.on('locks_updated', handleLocksUpdated);
    socket.on('lock_rejected', handleLockRejected);
    socket.on('ticket_error', handleTicketError);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('join_dashboard');
    }

    // Remove only the listeners registered by this component.
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('dashboard_state', handleDashboardState);
      socket.off('ticket_created', handleTicketCreated);
      socket.off('tickets_updated', handleTicketsUpdated);
      socket.off('locks_updated', handleLocksUpdated);
      socket.off('lock_rejected', handleLockRejected);
      socket.off('ticket_error', handleTicketError);
    };
  }, []);

  // Filter tickets using the search term and selected status.
  const filteredTickets = tickets.filter((ticket) => {
    const query = search.trim().toLowerCase();

    const ticketId = String(ticket.id || '').toLowerCase();
    const currentTruckId = String(ticket.truckId || '').toLowerCase();
    const ticketIssue = String(ticket.issue || '').toLowerCase();

    const matchesSearch =
      ticketId.includes(query) ||
      currentTruckId.includes(query) ||
      ticketIssue.includes(query);

    const matchesStatus =
      status === 'All' || ticket.status === status;

    return matchesSearch && matchesStatus;
  });

  // Create a new ticket and share it with connected agents.
  const createTicket = (event) => {
    event.preventDefault();

    const trimmedTruckId = truckId.trim();
    const trimmedIssue = issue.trim();

    if (!trimmedTruckId || !trimmedIssue) {
      setNotice('Please enter both Truck ID and issue details.');
      return;
    }

    if (!connected) {
      setNotice('Cannot create a ticket while the server is disconnected.');
      return;
    }

    socket.emit('create_ticket', {
      truckId: trimmedTruckId,
      issue: trimmedIssue,
    });

    setTruckId('');
    setIssue('');
    setShowForm(false);
    setNotice('');
  };

  // Ask the server to lock a ticket before opening its editor.
  const lockTicket = (ticketId) => {
    if (!connected) {
      setNotice('Please wait for the server connection.');
      return;
    }

    if (pendingLockRef.current) {
      setNotice('Please wait for the current lock request to finish.');
      return;
    }

    setNotice('');
    updatePendingLock(ticketId);

    socket.emit('lock_ticket', {
      ticketId,
      agentName,
    });
  };

  // Save the resolution and release the ticket lock.
  const saveResolution = () => {
    if (!editingTicket || !resolution.trim()) {
      return;
    }

    if (!connected) {
      setNotice('Connection lost. Please reconnect before saving.');
      return;
    }

    socket.emit('unlock_ticket', {
      ticketId: editingTicket,
      resolution: resolution.trim(),
      status: 'Resolved',
    });

    setEditingTicket(null);
    setResolution('');
    setNotice('');
  };

  // Close the editor and release the lock without saving.
  const closeEditor = () => {
    if (!editingTicket || !connected) {
      return;
    }

    socket.emit('unlock_ticket', {
      ticketId: editingTicket,
    });

    setEditingTicket(null);
    setResolution('');
  };

  // Calculate the current ticket summary.
  const openCount = tickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === 'Resolved'
  ).length;

  return (
    <div className="tickets-page">
      {/* Page heading and primary action */}
      <div className="tickets-page-header">
        <div>
          <h1>Live Ticket Board</h1>
          <p>
            Manage dispatch issues with real-time agent collaboration.
          </p>
        </div>

        <button
          className="create-ticket-btn"
          type="button"
          onClick={() => {
            setNotice('');
            setShowForm(true);
          }}
          disabled={!connected}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      {/* Live server connection status */}
      <div
        className={`tickets-connection-status ${
          connected ? 'connected' : 'disconnected'
        }`}
        role="status"
        aria-live="polite"
      >
        {connected ? <Wifi size={17} /> : <WifiOff size={17} />}

        {connected
          ? 'Connected to live server'
          : 'Connection Lost: Reconnecting...'}
      </div>

      {/* Display server and action messages */}
      {notice && (
        <div className="ticket-notice" role="alert">
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Ticket summary */}
      <div className="tickets-summary">
        <div className="ticket-summary-card">
          <Ticket size={20} />
          <span>Total Tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div className="ticket-summary-card">
          <span>Open Tickets</span>
          <strong>{openCount}</strong>
        </div>

        <div className="ticket-summary-card">
          <span>Resolved Tickets</span>
          <strong>{resolvedCount}</strong>
        </div>
      </div>

      {/* Main ticket management section */}
      <section className="tickets-management">
        <div className="tickets-management-header">
          <div>
            <h2>All Dispatch Tickets</h2>
            <p>Live ticket status and editing locks.</p>
          </div>

          {/* Search and status filters */}
          <div className="tickets-controls">
            <div className="tickets-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search tickets..."
                aria-label="Search tickets"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="tickets-filter"
              aria-label="Filter tickets by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Live ticket table */}
        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th scope="col">Ticket</th>
                <th scope="col">Truck ID</th>
                <th scope="col">Issue</th>
                <th scope="col">Status</th>
                <th scope="col">Resolution</th>
                <th scope="col">Lock Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map((ticket) => {
                const lock = locks[ticket.id];

                const lockedByOther =
                  Boolean(lock) && lock.socketId !== socket.id;

                const isEditing = editingTicket === ticket.id;
                const isPending = pendingLockTicket === ticket.id;

                const ticketStatus = String(
                  ticket.status || 'Open'
                );

                return (
                  <tr
                    key={ticket.id}
                    className={
                      lockedByOther ? 'ticket-locked-row' : ''
                    }
                  >
                    <td className="ticket-id">{ticket.id}</td>

                    <td>{ticket.truckId}</td>

                    <td>{ticket.issue}</td>

                    <td>
                      <span
                        className={`status-badge ${ticketStatus
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {ticketStatus}
                      </span>
                    </td>

                    <td>{ticket.resolution || '—'}</td>

                    <td>
                      {lock ? (
                        <span className="ticket-lock-status">
                          <Lock size={14} />
                          {' '}Locked by {lock.agentName}
                        </span>
                      ) : (
                        <span className="ticket-lock-status">
                          <Unlock size={14} />
                          {' '}Available
                        </span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="ticket-edit-actions">
                          <textarea
                            value={resolution}
                            onChange={(event) =>
                              setResolution(event.target.value)
                            }
                            placeholder="Enter resolution..."
                            aria-label={`Resolution for ${ticket.id}`}
                            rows={2}
                          />

                          <button
                            type="button"
                            onClick={saveResolution}
                            disabled={!resolution.trim() || !connected}
                          >
                            <Save size={15} />
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={closeEditor}
                            disabled={!connected}
                          >
                            <X size={15} />
                            Close
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="ticket-action-btn"
                          disabled={
                            Boolean(lock) ||
                            !connected ||
                            Boolean(pendingLockTicket)
                          }
                          onClick={() => lockTicket(ticket.id)}
                        >
                          <Lock size={16} />

                          {isPending
                            ? 'Locking...'
                            : lockedByOther
                              ? 'Locked'
                              : 'Edit'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Empty state */}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-tickets">
                    {connected
                      ? 'No tickets found.'
                      : 'Waiting for server connection...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tickets-footer">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </section>

      {/* Create ticket modal */}
      {showForm && (
        <div
          className="ticket-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ticket-modal-header">
              <div>
                <h2 id="ticket-modal-title">
                  Create Dispatch Ticket
                </h2>
                <p>Add a new truck issue.</p>
              </div>

              <button
                type="button"
                className="ticket-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createTicket}>
              <label htmlFor="truck-id">
                Truck ID

                <input
                  id="truck-id"
                  value={truckId}
                  onChange={(event) => setTruckId(event.target.value)}
                  placeholder="Example: TX-9982"
                  required
                />
              </label>

              <label htmlFor="ticket-issue">
                Issue

                <textarea
                  id="ticket-issue"
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  placeholder="Describe the dispatch issue..."
                  rows={4}
                  required
                />
              </label>

              <div className="ticket-modal-actions">
                <button
                  type="button"
                  className="ticket-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-ticket-btn"
                  disabled={!connected}
                >
                  <Plus size={17} />
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
