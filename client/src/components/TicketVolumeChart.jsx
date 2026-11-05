import './TicketVolumeChart.css';
function TicketVolumeChart({
  data = [],
  filters = [],
  selectedFilter = '24H',
  onFilterChange,
}) {
  const maxTickets = Math.max(
    ...data.map((item) => item.tickets),
    1
  );

  const chartHeight = 180;
  const chartWidth = 600;
  const chartPadding = 25;

  const points = data.map((item, index) => {
    const x =
      data.length > 1
        ? chartPadding +
          (index / (data.length - 1)) *
            (chartWidth - chartPadding * 2)
        : chartWidth / 2;

    const y =
      chartHeight -
      (item.tickets / maxTickets) * (chartHeight - 35);

    return { x, y, ...item };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  return (
    <section className="ticket-volume-chart">
      <div className="ticket-chart-header">
        <div>
          <h3>Ticket Volume</h3>
          <p>Incoming support tickets over time</p>
        </div>

        <div className="ticket-chart-filters">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                selectedFilter === filter.value ? 'active' : ''
              }
              onClick={() => onFilterChange?.(filter.value)}
            >
              {filter.value}
            </button>
          ))}
        </div>
      </div>

      <div className="ticket-chart-content">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 25}`}
          role="img"
          aria-label="Ticket volume trend chart"
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 1, 2, 3].map((line) => {
            const y = 20 + line * 50;

            return (
              <line
                key={line}
                x1="25"
                y1={y}
                x2="575"
                y2={y}
                stroke="#26364d"
                strokeDasharray="4 5"
              />
            );
          })}

          <polyline
            points={linePoints}
            fill="none"
            stroke="#399dff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#399dff"
              stroke="#0b1220"
              strokeWidth="2"
            />
          ))}
        </svg>

        <div className="ticket-chart-labels">
          {data.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TicketVolumeChart;
