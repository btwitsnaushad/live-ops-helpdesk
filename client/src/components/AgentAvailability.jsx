
import './AgentAvailability.css';

function AgentAvailability({ agents }) {
  const {
    total = 0,
    available = 0,
    onTicket = 0,
    offline = 0,
  } = agents || {};

  const availabilityItems = [
    { label: 'Available', value: available, color: 'available' },
    { label: 'On Ticket', value: onTicket, color: 'on-ticket' },
    { label: 'Offline', value: offline, color: 'offline' },
  ];

  return (
    <section className="agent-availability">
      <div className="agent-availability-header">
        <div>
          <h3>Agent Availability</h3>
          <p>Current team status</p>
        </div>

        <span className="agent-total">{total} Total</span>
      </div>

      <div className="agent-availability-summary">
        <strong>{available}</strong>
        <span>Agents currently available</span>
      </div>

      <div className="agent-availability-list">
        {availabilityItems.map((item) => {
          const percentage = total
            ? (item.value / total) * 100
            : 0;

          return (
            <div className="availability-item" key={item.color}>
              <div className="availability-item-info">
                <div className="availability-label">
                  <span className={`availability-dot ${item.color}`} />
                  <span>{item.label}</span>
                </div>

                <strong>{item.value}</strong>
              </div>

              <div
                className="availability-progress"
                role="progressbar"
                aria-label={`${item.label} agents`}
                aria-valuenow={item.value}
                aria-valuemin={0}
                aria-valuemax={total}
              >
                <div
                  className={`availability-progress-fill ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AgentAvailability;
