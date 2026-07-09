function buildPath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function formatValue(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

export function CurveChart({ date, data, loading }) {
  const width = 760;
  const height = 320;
  const padding = { top: 20, right: 22, bottom: 48, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (!data.length) {
    return (
      <div className="curve-chart curve-chart--empty">
        <div className="curve-chart__meta">
          <div>
            <p className="section-kicker">Yield curve</p>
            <h2>{date}</h2>
          </div>
        </div>
        <div className="curve-chart__empty">
          <p>Pick a date and load the curve.</p>
        </div>
      </div>
    );
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 0.75);
  const yMin = Math.max(0, min - spread * 0.22);
  const yMax = max + spread * 0.22;
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((point, index) => {
    const x = padding.left + index * stepX;
    const y =
      padding.top + ((yMax - point.value) / Math.max(yMax - yMin, 0.0001)) * innerHeight;

    return { ...point, x, y };
  });

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const linePath = buildPath(points);
  const areaPath = `${linePath} L ${lastPoint.x} ${padding.top + innerHeight} L ${firstPoint.x} ${padding.top + innerHeight} Z`;
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = yMax - (index / tickCount) * (yMax - yMin);
    const y = padding.top + (index / tickCount) * innerHeight;

    return { value, y };
  });

  return (
    <div className={`curve-chart ${loading ? "curve-chart--loading" : ""}`}>
      <div className="curve-chart__meta">
        <div>
          <p className="section-kicker">Yield curve</p>
          <h2>{date}</h2>
        </div>
        <p className="curve-chart__subtle">{data.length} maturities</p>
      </div>

      <div className="curve-chart__frame">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="curve-chart__svg"
          role="img"
          aria-label={`Yield curve for ${date}`}
        >

          {ticks.map((tick) => (
            <g key={tick.y}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={tick.y}
                y2={tick.y}
                className="curve-chart__grid"
              />
              <text x={16} y={tick.y + 4} className="curve-chart__axis-label">
                {formatValue(tick.value)}
              </text>
            </g>
          ))}

          <path d={areaPath} className="curve-chart__area" />
          <path d={linePath} className="curve-chart__line" />

          {points.map((point) => (
            <g key={point.maturity}>
              <circle cx={point.x} cy={point.y} r="7" className="curve-chart__point" />
              <title>{`${point.label}: ${formatValue(point.value)}`}</title>
            </g>
          ))}

          {points.map((point) => (
            <text
              key={`${point.maturity}-label`}
              x={point.x}
              y={height - 20}
              textAnchor="middle"
              className="curve-chart__maturity"
            >
              {point.label}
            </text>
          ))}
        </svg>

        {loading ? <div className="curve-chart__loading">Loading curve...</div> : null}
      </div>
    </div>
  );
}
