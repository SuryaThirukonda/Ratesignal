function linePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function displayDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function formatValue(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "--";
}

export function TimeSeriesChart({ title, eyebrow, data, loading }) {
  const width = 760;
  const height = 340;
  const padding = { top: 24, right: 24, bottom: 54, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (!data.length) {
    return (
      <div className="curve-chart curve-chart--empty">
        <div className="curve-chart__meta">
          <div>
            <p className="section-kicker">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
        </div>
        <div className="curve-chart__empty"><p>Choose filters, then load the series.</p></div>
      </div>
    );
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.5);
  const yMin = Math.max(0, min - span * 0.2);
  const yMax = max + span * 0.2;
  const xStep = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth / 2;
  const points = data.map((point, index) => ({
    ...point,
    x: data.length > 1 ? padding.left + index * xStep : padding.left + xStep,
    y: padding.top + ((yMax - point.value) / Math.max(yMax - yMin, 0.0001)) * innerHeight
  }));
  const path = linePath(points);
  const first = points[0];
  const last = points.at(-1);
  const area = `${path} L ${last.x} ${padding.top + innerHeight} L ${first.x} ${padding.top + innerHeight} Z`;
  const yTicks = Array.from({ length: 5 }, (_, index) => ({
    value: yMax - (index / 4) * (yMax - yMin),
    y: padding.top + (index / 4) * innerHeight
  }));
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <div className={`curve-chart ${loading ? "curve-chart--loading" : ""}`}>
      <div className="curve-chart__meta">
        <div>
          <p className="section-kicker">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="curve-chart__subtle">{data.length} observations</p>
      </div>

      <div className="curve-chart__frame">
        <svg viewBox={`0 0 ${width} ${height}`} className="curve-chart__svg" role="img" aria-label={title}>
          {yTicks.map((tick) => (
            <g key={tick.y}>
              <line x1={padding.left} x2={width - padding.right} y1={tick.y} y2={tick.y} className="curve-chart__grid" />
              <text x={42} y={tick.y + 4} className="curve-chart__axis-label">{formatValue(tick.value)}</text>
            </g>
          ))}

          <path d={area} className="curve-chart__area" />
          <path d={path} className="curve-chart__line" />
          {points.map((point) => (
            <g key={`${point.date}-${point.value}`}>
              <circle cx={point.x} cy={point.y} r="4" className="curve-chart__point" />
              <title>{`${displayDate(point.date)}: ${formatValue(point.value)}%`}</title>
            </g>
          ))}
          {labelIndexes.map((index) => (
            <text key={index} x={points[index].x} y={height - 20} className="curve-chart__maturity">
              {displayDate(points[index].date)}
            </text>
          ))}
        </svg>
        {loading ? <div className="curve-chart__loading">Loading series...</div> : null}
      </div>
    </div>
  );
}
