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
} from 'lucide-react';

import { sampleTickets } from '../data/sampleTickets';

function Tickets() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const tickets = sampleTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === 'All' || ticket.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tickets-page">
      <div className="tickets-page-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage and monitor customer support tickets.</p>
        </div>

        <button className="create-ticket-btn" type="button">
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      <div className="tickets-summary">
        <div className="ticket-summary-card">
          <Ticket size={20} />
          <span>Total Tickets</span>
          <strong>{sampleTickets.length}</strong>
        </div>

        <div className="ticket-summary-card">
          <Clock size={20} />
          <span>Open Tickets</span>
          <strong>
            {sampleTickets.filter((ticket) => ticket.status === 'Open').length}
          </strong>
        </div>

        <div className="ticket-summary-card">
          <AlertCircle size={20} />
          <span>In Progress</span>
          <strong>
            {sampleTickets.filter((ticket) => ticket.status === 'In Progress').length}
          </strong>
        </div>

        <div className="ticket-summary-card">
          <CheckCircle size={20} />
          <span>Resolved</span>
          <strong>
            {sampleTickets.filter((ticket) => ticket.status === 'Resolved').length}
          </strong>
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
          Showing {tickets.length} of {sampleTickets.length} tickets
        </div>
      </section>
    </div>
  );
}

export default Tickets;
