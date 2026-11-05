import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';

import { sampleTickets } from '../data/sampleTickets';

function Tickets() {
  const [allTickets, setAllTickets] = useState(sampleTickets);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    subject: '',
    priority: 'Medium',
    agent: 'Unassigned',
  });

  const tickets = allTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === 'All' || ticket.status === status;

    return matchesSearch && matchesStatus;
  });

  const openTickets = allTickets.filter(
    (ticket) => ticket.status === 'Open'
  ).length;

  const inProgressTickets = allTickets.filter(
    (ticket) => ticket.status === 'In Progress'
  ).length;

  const resolvedTickets = allTickets.filter(
    (ticket) => ticket.status === 'Resolved'
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateTicket = (event) => {
    event.preventDefault();

    const customer = formData.customer.trim();
    const subject = formData.subject.trim();

    if (!customer || !subject) {
      return;
    }

    const highestTicketNumber = allTickets.reduce((highest, ticket) => {
      const number = Number(ticket.id.replace('TKT-', ''));

      return Number.isFinite(number)
        ? Math.max(highest, number)
        : highest;
    }, 0);

    const initials = customer
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newTicket = {
      id: `TKT-${highestTicketNumber + 1}`,
      customer,
      initials,
      subject,
      priority: formData.priority,
      status: 'Open',
      agent: formData.agent,
      updated: 'Just now',
    };

    setAllTickets((previous) => [newTicket, ...previous]);

    setFormData({
      customer: '',
      subject: '',
      priority: 'Medium',
      agent: 'Unassigned',
    });

    setSearch('');
    setStatus('All');
    setShowForm(false);
  };

  return (
    <div className="tickets-page">
      <div className="tickets-page-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage and monitor customer support tickets.</p>
        </div>

        <button
          className="create-ticket-btn"
          type="button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      <div className="tickets-summary">
        <div className="ticket-summary-card">
          <Ticket size={20} />
          <span>Total Tickets</span>
          <strong>{allTickets.length}</strong>
        </div>

        <div className="ticket-summary-card">
          <Clock size={20} />
          <span>Open Tickets</span>
          <strong>{openTickets}</strong>
        </div>

        <div className="ticket-summary-card">
          <AlertCircle size={20} />
          <span>In Progress</span>
          <strong>{inProgressTickets}</strong>
        </div>

        <div className="ticket-summary-card">
          <CheckCircle size={20} />
          <span>Resolved</span>
          <strong>{resolvedTickets}</strong>
        </div>
      </div>

      <section className="tickets-management">
        <div className="tickets-management-header">
          <div>
            <h2>All Tickets</h2>
            <p>View and manage customer requests.</p>
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

            <div className="tickets-filter">
              <Filter size={16} />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="ticket-id">{ticket.id}</td>

                    <td>
                      <div className="ticket-customer">
                        <span className="customer-avatar">
                          {ticket.initials}
                        </span>
                        {ticket.customer}
                      </div>
                    </td>

                    <td>{ticket.subject}</td>

                    <td>
                      <span
                        className={`priority-badge ${ticket.priority.toLowerCase()}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${ticket.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td>{ticket.agent}</td>

                    <td>{ticket.updated}</td>

                    <td>
                      <button
                        type="button"
                        className="ticket-action-btn"
                        aria-label={`More options for ${ticket.id}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-tickets">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="tickets-footer">
          Showing {tickets.length} of {allTickets.length} tickets
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
            aria-labelledby="create-ticket-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ticket-modal-header">
              <div>
                <h2 id="create-ticket-title">Create Ticket</h2>
                <p>Add a new customer support request.</p>
              </div>

              <button
                type="button"
                className="ticket-modal-close"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <label>
                Customer Name
                <input
                  type="text"
                  name="customer"
                  placeholder="Enter customer name"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter ticket subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Priority
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label>
                Assigned Agent
                <select
                  name="agent"
                  value={formData.agent}
                  onChange={handleInputChange}
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Aarav Roy">Aarav Roy</option>
                  <option value="Priya Sharma">Priya Sharma</option>
                  <option value="Dev Kumar">Dev Kumar</option>
                  <option value="Meera Singh">Meera Singh</option>
                  <option value="Rahul Verma">Rahul Verma</option>
                  <option value="Ananya Gupta">Ananya Gupta</option>
                </select>
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
