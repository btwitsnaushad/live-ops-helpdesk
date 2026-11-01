import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  subtitle,
}) {
  const isPositive = trend >= 0;

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {Icon && <Icon size={21} strokeWidth={2} />}
        </div>

        <span className="stat-card-title">{title}</span>

        <button
          type="button"
          className="stat-card-menu"
          aria-label={`More options for ${title}`}
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      <div className="stat-card-value">{value}</div>

      <div className="stat-card-footer">
        {trend !== undefined && (
          <span className={`stat-card-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {Math.abs(trend)}%
          </span>
        )}

        <span className="stat-card-subtitle">
          {trendLabel || subtitle || ''}
        </span>
      </div>
    </div>
  );
}

export default StatCard;