
import './TicketVolumeChart.css';

function TicketVolumeChart({
  data = [],
  filters = [],
  selectedFilter = '24H',
  onFilterChange,
}) {
  const chartWidth = 600;
  const chartHeight = 200;
  const leftPadding = 35;
  const rightPadding = 20;
  const topPadding = 20;
  const bottomPadding = 25;

  const maxTickets = Math.max(
    ...data.map((item) => Number(item.tickets) || 0),
    1
  );

  const points = data.map((item, index) => {
    const x =
      data.length > 1
        ? leftPadding +
          (index / (data.length - 1)) *
            (chartWidth - leftPadding - rightPadding)
        : chartWidth / 2;

    const y =
      chartHeight -
      bottomPadding -
      ((Number(item.tickets) || 0) / maxTickets) *
        (chartHeight - topPadding - bottomPadding);

    return {
      x,
      y,
      ...item,
    };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  const areaPoints = points.length
    ? `${leftPadding},${chartHeight - bottomPadding} ${linePoints} ${points[points.length - 1].x},${chartHeight - bottomPadding}`
    : '';

  return (
    <section className="ticket-volume-chart">
      <div className="ticket-chart-header">
        <div>
          <span className="chart-eyebrow">ANALYTICS</span>
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
              aria-pressed={selectedFilter === filter.value}
            >
              {filter.value}
            </button>
          ))}
        </div>
      </div>

      <div className="ticket-chart-content">
        {data.length === 0 ? (
          <div className="ticket-chart-empty">
            No ticket volume data available.
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Ticket volume trend chart"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="ticket-area-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#399dff"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="#399dff"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3, 4].map((line) => {
                const y =
                  topPadding +
                  (line / 4) *
                    (chartHeight - topPadding - bottomPadding);

                return (
                  <line
                    key={line}
                    x1={leftPadding}
                    y1={y}
                    x2={chartWidth - rightPadding}
                    y2={y}
                    stroke="#26364d"
                    strokeDasharray="4 5"
                  />
                );
              })}

              <polygon
                points={areaPoints}
                fill="url(#ticket-area-gradient)"
              />

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
                  stroke="#111e31"
                  strokeWidth="2"
                />
              ))}
            </svg>

            <div className="ticket-chart-labels">
              {data.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default TicketVolumeChart;
