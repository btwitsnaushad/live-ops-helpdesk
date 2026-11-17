
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

  // Keep socket listeners active while the component is mounted.
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setNotice('');
      socket.emit('join_dashboard');
    };

    const handleDisconnect = () => {
      setConnected(false);
      pendingLockRef.current = null;
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
      setTickets((currentTickets) => [
        ticket,
        ...currentTickets.filter((item) => item.id !== ticket.id),
      ]);
    };

    const handleTicketsUpdated = (updatedTickets) => {
      setTickets(updatedTickets || []);
    };

    const handleLocksUpdated = (updatedLocks) => {
      const currentLocks = updatedLocks || {};
      setLocks(currentLocks);

      const requestedTicket = pendingLockRef.current;

      // Open the editor only after the server confirms the lock.
      if (requestedTicket) {
        const confirmedLock = currentLocks[requestedTicket];

        if (confirmedLock?.socketId === socket.id) {
          setEditingTicket(requestedTicket);
          setResolution('');
          pendingLockRef.current = null;
          setPendingLockTicket(null);
        }
      }
    };

    const handleLockRejected = ({ lockedBy, message } = {}) => {
      pendingLockRef.current = null;
      setPendingLockTicket(null);
      setEditingTicket(null);
      setResolution('');

      setNotice(
        message ||
          `This ticket is already locked by ${lockedBy || 'another agent'}.`
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
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      String(ticket.id || '').toLowerCase().includes(query) ||
      String(ticket.truckId || '').toLowerCase().includes(query) ||
      String(ticket.issue || '').toLowerCase().includes(query);

    const matchesStatus =
      status === 'All' || ticket.status === status;

    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === 'Resolved'
  ).length;

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

  const lockTicket = (ticketId) => {
    if (!connected || pendingLockRef.current) {
      setNotice('Please wait for the current server request.');
      return;
    }

    setNotice('');
    pendingLockRef.current = ticketId;
    setPendingLockTicket(ticketId);

    socket.emit('lock_ticket', {
      ticketId,
      agentName,
    });
  };

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

  const closeCreateForm = () => {
    setShowForm(false);
    setTruckId('');
    setIssue('');
  };

  return (
    <main className="tickets-page">
      <header className="tickets-page-header">
        <div className="page-heading">
          <h1>Live Ticket Board</h1>
          <p>Manage dispatch issues with real-time agent collaboration.</p>
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
      </header>

      <div
        className={`tickets-connection-status ${
          connected ? 'connected' : 'disconnected'
        }`}
        role="status"
      >
        {connected ? <Wifi size={17} /> : <WifiOff size={17} />}
        <span>
          {connected
            ? 'Connected to live server'
            : 'Connection Lost: Reconnecting...'}
        </span>
      </div>

      {notice && (
        <div className="ticket-notice" role="alert">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="tickets-summary" aria-label="Ticket summary">
        <article className="ticket-summary-card">
          <Ticket size={20} />
          <span>Total Tickets</span>
          <strong>{tickets.length}</strong>
        </article>

        <article className="ticket-summary-card">
          <span>Open Tickets</span>
          <strong>{openCount}</strong>
        </article>

        <article className="ticket-summary-card">
          <span>Resolved Tickets</span>
          <strong>{resolvedCount}</strong>
        </article>
      </section>

      <section className="tickets-management">
        <div className="tickets-management-header">
          <div>
            <h2>All Dispatch Tickets</h2>
            <p>Live ticket status and editing locks.</p>
          </div>

          <div className="tickets-controls">
            <label className="tickets-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search tickets..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tickets"
              />
            </label>

            <select
              className="tickets-filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter tickets by status"
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
                const isEditing = editingTicket === ticket.id;
                const isPending = pendingLockTicket === ticket.id;
                const lockedByOther = lock && lock.socketId !== socket.id;

                return (
                  <tr
                    key={ticket.id}
                    className={lockedByOther ? 'ticket-locked-row' : ''}
                  >
                    <td className="ticket-id">{ticket.id}</td>
                    <td>{ticket.truckId}</td>
                    <td className="ticket-issue">{ticket.issue}</td>

                    <td>
                      <span
                        className={`status-badge ${String(
                          ticket.status || ''
                        )
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="ticket-resolution">
                      {ticket.resolution || '—'}
                    </td>

                    <td>
                      {lock ? (
                        <span className="lock-indicator locked">
                          <Lock size={15} />
                          Locked by {lock.agentName}
                        </span>
                      ) : (
                        <span className="lock-indicator available">
                          <Unlock size={15} />
                          Available
                        </span>
                      )}
                    </td>

                    <td className="ticket-action-cell">
                      {isEditing ? (
                        <div className="ticket-edit-actions">
                          <textarea
                            value={resolution}
                            onChange={(event) =>
                              setResolution(event.target.value)
                            }
                            placeholder="Enter resolution..."
                            rows={2}
                            aria-label="Ticket resolution"
                          />

                          <button
                            className="save-ticket-btn"
                            type="button"
                            onClick={saveResolution}
                            disabled={!resolution.trim() || !connected}
                          >
                            <Save size={15} />
                            Save
                          </button>

                          <button
                            className="close-editor-btn"
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
                          className="ticket-action-btn"
                          type="button"
                          disabled={
                            Boolean(lock) ||
                            !connected ||
                            Boolean(pendingLockTicket)
                          }
                          onClick={() => lockTicket(ticket.id)}
                        >
                          <Lock size={15} />
                          {isPending ? 'Locking...' : 'Edit'}
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

        <footer className="tickets-footer">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </footer>
      </section>

      {showForm && (
        <div
          className="ticket-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateForm();
            }
          }}
        >
          <section
            className="ticket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
          >
            <div className="ticket-modal-header">
              <div>
                <h2 id="ticket-modal-title">Create Dispatch Ticket</h2>
                <p>Add a new truck issue.</p>
              </div>

              <button
                className="ticket-modal-close"
                type="button"
                onClick={closeCreateForm}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createTicket}>
              <label>
                Truck ID
                <input
                  value={truckId}
                  onChange={(event) => setTruckId(event.target.value)}
                  placeholder="Example: TX-9982"
                  required
                />
              </label>

              <label>
                Issue
                <textarea
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  placeholder="Describe the dispatch issue..."
                  rows={4}
                  required
                />
              </label>

              <div className="ticket-modal-actions">
                <button
                  className="ticket-cancel-btn"
                  type="button"
                  onClick={closeCreateForm}
                >
                  Cancel
                </button>

                <button
                  className="create-ticket-btn"
                  type="submit"
                  disabled={!connected}
                >
                  <Plus size={17} />
                  Create Ticket
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Tickets;
