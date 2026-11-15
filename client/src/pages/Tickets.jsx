
import { useEffect, useState } from 'react';
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

  const agentName = 'Support Agent';

  // Set up socket listeners and load dashboard data.
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setNotice('');
      socket.emit('join_dashboard');
    };

    const handleDisconnect = () => {
      setConnected(false);
      setPendingLockTicket(null);
      setEditingTicket(null);
      setResolution('');
      setNotice('Connection Lost: Reconnecting...');
    };

    const handleDashboardState = (data = {}) => {
      setTickets(data.tickets || []);
      setLocks(data.locks || {});
    };

    const handleTicketCreated = (ticket) => {
      setTickets((previous) => [
        ticket,
        ...previous.filter((item) => item.id !== ticket.id),
      ]);
    };

    const handleTicketsUpdated = (updatedTickets) => {
      setTickets(updatedTickets || []);
    };

    const handleLocksUpdated = (updatedLocks) => {
      const currentLocks = updatedLocks || {};
      setLocks(currentLocks);

      // Open the editor only after the server confirms our lock.
      if (pendingLockTicket) {
        const confirmedLock = currentLocks[pendingLockTicket];

        if (confirmedLock?.socketId === socket.id) {
          setEditingTicket(pendingLockTicket);
          setResolution('');
          setPendingLockTicket(null);
        }
      }
    };

    const handleLockRejected = ({ lockedBy, message } = {}) => {
      setPendingLockTicket(null);
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
      setNotice(message || 'Unable to create ticket.');
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
  }, [pendingLockTicket]);

  // Search and status filtering.
  const filteredTickets = tickets.filter((ticket) => {
    const query = search.toLowerCase();

    const matchesSearch =
      ticket.id.toLowerCase().includes(query) ||
      ticket.truckId.toLowerCase().includes(query) ||
      ticket.issue.toLowerCase().includes(query);

    const matchesStatus =
      status === 'All' || ticket.status === status;

    return matchesSearch && matchesStatus;
  });

  // Create a new dispatch ticket.
  const createTicket = (event) => {
    event.preventDefault();

    if (!truckId.trim() || !issue.trim() || !connected) {
      return;
    }

    socket.emit('create_ticket', {
      truckId: truckId.trim(),
      issue: issue.trim(),
    });

    setTruckId('');
    setIssue('');
    setShowForm(false);
    setNotice('');
  };

  // Request a lock from the server before opening the editor.
  const lockTicket = (ticketId) => {
    if (!connected || pendingLockTicket) {
      setNotice('Please wait for the server connection.');
      return;
    }

    setNotice('');
    setPendingLockTicket(ticketId);

    socket.emit('lock_ticket', {
      ticketId,
      agentName,
    });
  };

  // Save resolution and release the lock.
  const saveResolution = () => {
    if (!editingTicket || !resolution.trim() || !connected) {
      return;
    }

    socket.emit('unlock_ticket', {
      ticketId: editingTicket,
      resolution: resolution.trim(),
      status: 'Resolved',
    });

    setEditingTicket(null);
    setResolution('');
  };

  // Close the editor without saving.
  const closeEditor = () => {
    if (!editingTicket) {
      return;
    }

    socket.emit('unlock_ticket', {
      ticketId: editingTicket,
    });

    setEditingTicket(null);
    setResolution('');
  };

  const openCount = tickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === 'Resolved'
  ).length;

  return (
    <div className="tickets-page">
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
          onClick={() => setShowForm(true)}
          disabled={!connected}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      <div className="tickets-connection-status">
        {connected ? <Wifi size={17} /> : <WifiOff size={17} />}

        {connected
          ? 'Connected to live server'
          : 'Connection Lost: Reconnecting...'}
      </div>

      {notice && (
        <div className="ticket-notice" role="alert">
          {notice}

          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

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

      <section className="tickets-management">
        <div className="tickets-management-header">
          <div>
            <h2>All Dispatch Tickets</h2>
            <p>Live ticket status and editing locks.</p>
          </div>

          <div className="tickets-controls">
            <div className="tickets-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="tickets-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Truck ID</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Resolution</th>
                <th>Lock Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map((ticket) => {
                const lock = locks[ticket.id];

                const lockedByOther =
                  lock && lock.socketId !== socket.id;

                const isEditing = editingTicket === ticket.id;

                const isPending =
                  pendingLockTicket === ticket.id;

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
                        className={`status-badge ${ticket.status
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>{ticket.resolution || '—'}</td>

                    <td>
                      {lock ? (
                        <span>
                          <Lock size={14} />
                          {' '}Locked by {lock.agentName}
                        </span>
                      ) : (
                        <span>
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
                            rows={2}
                          />

                          <button
                            type="button"
                            onClick={saveResolution}
                            disabled={
                              !resolution.trim() || !connected
                            }
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

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-tickets">
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
              <label>
                Truck ID

                <input
                  value={truckId}
                  onChange={(event) =>
                    setTruckId(event.target.value)
                  }
                  placeholder="Example: TX-9982"
                  required
                />
              </label>

              <label>
                Issue

                <textarea
                  value={issue}
                  onChange={(event) =>
                    setIssue(event.target.value)
                  }
                  placeholder="Describe the dispatch issue..."
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
