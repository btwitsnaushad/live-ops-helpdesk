const sampleTickets = [
  {
    id: 'TKT-2048',
    customer: 'Olivia Martin',
    initials: 'OM',
    subject: 'Unable to access my account',
    priority: 'High',
    status: 'Open',
    agent: 'Aarav Roy',
    updated: '5 min ago',
  },
  {
    id: 'TKT-2047',
    customer: 'Ethan Walker',
    initials: 'EW',
    subject: 'Payment confirmation missing',
    priority: 'Medium',
    status: 'In Progress',
    agent: 'Priya Sharma',
    updated: '12 min ago',
  },
  {
    id: 'TKT-2046',
    customer: 'Sophia Chen',
    initials: 'SC',
    subject: 'Order status has not updated',
    priority: 'High',
    status: 'Resolved',
    agent: 'Dev Kumar',
    updated: '28 min ago',
  },
  {
    id: 'TKT-2045',
    customer: 'Noah Patel',
    initials: 'NP',
    subject: 'Request to update account details',
    priority: 'Low',
    status: 'Open',
    agent: 'Meera Singh',
    updated: '34 min ago',
  },
];

function RecentTickets({ tickets = sampleTickets, onViewAll }) {
  return (
    <section className="recent-tickets">
      <div className="recent-tickets-header">
        <div>
          <h3>Recent Tickets</h3>
          <p>Your latest customer support activity</p>
        </div>

        <button type="button" onClick={onViewAll}>
          View all tickets →
        </button>
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
                    <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>

                  <td>{ticket.agent}</td>
                  <td>{ticket.updated}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-tickets">
                  No tickets available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="recent-tickets-footer">
        Showing {tickets.length} tickets
      </div>
    </section>
  );
}

export default RecentTickets;