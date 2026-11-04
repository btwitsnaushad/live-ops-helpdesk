
import { useState } from 'react';
import {
  Search,
  Users,
  CheckCircle,
  Clock,
  UserX,
} from 'lucide-react';

import { sampleAgents } from '../data/sampleAgents';

function Agents() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Filter agents by name, email, ID, or status.
  const filteredAgents = sampleAgents.filter((agent) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      agent.name.toLowerCase().includes(searchValue) ||
      agent.email.toLowerCase().includes(searchValue) ||
      agent.id.toLowerCase().includes(searchValue);

    const matchesStatus =
      status === 'All' || agent.status === status;

    return matchesSearch && matchesStatus;
  });

  // Calculate agent availability.
  const availableAgents = sampleAgents.filter(
    (agent) => agent.status === 'Available'
  ).length;

  const busyAgents = sampleAgents.filter(
    (agent) => agent.status === 'On a ticket'
  ).length;

  const offlineAgents = sampleAgents.filter(
    (agent) => agent.status === 'Offline'
  ).length;

  return (
    <section className="page-container">
      {/* Page heading */}
      <div className="page-header">
        <h1>Agents</h1>
        <p>
          Manage your support team and agent availability.
        </p>
      </div>

      {/* Agent statistics */}
      <div className="agent-stats">
        <div className="dashboard-card">
          <Users size={22} />

          <h3>Total Agents</h3>

          <h2>{sampleAgents.length}</h2>
        </div>

        <div className="dashboard-card">
          <CheckCircle size={22} />

          <h3>Available</h3>

          <h2>{availableAgents}</h2>
        </div>

        <div className="dashboard-card">
          <Clock size={22} />

          <h3>On a Ticket</h3>

          <h2>{busyAgents}</h2>
        </div>

        <div className="dashboard-card">
          <UserX size={22} />

          <h3>Offline</h3>

          <h2>{offlineAgents}</h2>
        </div>
      </div>

      {/* Agent management */}
      <div className="dashboard-card agent-management">
        <div className="agent-management-header">
          <div>
            <h3>Agent Management</h3>

            <p>
              View and manage your support team.
            </p>
          </div>

          <span className="agent-count">
            {filteredAgents.length}{' '}
            {filteredAgents.length === 1 ? 'Agent' : 'Agents'}
          </span>
        </div>

        {/* Search and status filters */}
        <div className="agent-filters">
          <div className="agent-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="On a ticket">On a Ticket</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Agent table */}
        <div className="agents-table-wrapper">
          <table className="agents-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Role</th>
                <th>Status</th>
                <th>Resolved</th>
                <th>Active Tickets</th>
                <th>Response Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id}>
                  <td>
                    <div className="agent-info">
                      <div className="agent-avatar">
                        {agent.initials}
                      </div>

                      <div className="agent-details">
                        <strong>{agent.name}</strong>

                        <span>{agent.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{agent.role}</td>

                  <td>
                    <span
                      className={`agent-status ${
                        agent.status === 'Available'
                          ? 'status-available'
                          : agent.status === 'On a ticket'
                          ? 'status-busy'
                          : 'status-offline'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>

                  <td>{agent.ticketsResolved}</td>

                  <td>{agent.activeTickets}</td>

                  <td>{agent.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {filteredAgents.length === 0 && (
            <div className="agent-empty">
              <Users size={28} />

              <p>No agents found.</p>

              <span>
                Try another search or select a different status.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Agents;
