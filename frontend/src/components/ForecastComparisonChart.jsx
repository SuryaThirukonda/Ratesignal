import { PREDICTION_MODELS } from "../lib/yields";

const MODEL_COLORS = ["#2563eb", "#dc2626", "#d97706", "#059669", "#7c3aed"];

function linePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function displayDate(value) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatValue(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "--";
}

function dateValue(value) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).getTime();
}

export function ForecastComparisonChart({ actual, predictions, maturityLabel, loading }) {
  const width = 900;
  const height = 390;
  const padding = { top: 28, right: 28, bottom: 58, left: 58 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const allPoints = [...actual, ...predictions];

  if (!allPoints.length) {
    return (
      <div className="curve-chart curve-chart--empty">
        <div className="curve-chart__meta">
          <div>
            <p className="section-kicker">Observed to forecast</p>
            <h2>{maturityLabel} forward range</h2>
          </div>
        </div>
        <div className="curve-chart__empty"><p>Choose forecasts, then load the comparison.</p></div>
      </div>
    );
  }

  const values = allPoints.map((point) => point.value);
  const dates = allPoints.map((point) => dateValue(point.date));
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateSpan = Math.max(maxDate - minDate, 1);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueSpan = Math.max(maxValue - minValue, 0.5);
  const yMin = Math.max(0, minValue - valueSpan * 0.2);
  const yMax = maxValue + valueSpan * 0.2;
  const scalePoint = (point) => ({
    ...point,
    x: padding.left + ((dateValue(point.date) - minDate) / dateSpan) * innerWidth,
    y: padding.top + ((yMax - point.value) / Math.max(yMax - yMin, 0.0001)) * innerHeight
  });
  const actualPoints = actual.map(scalePoint);
  const predictionSeries = PREDICTION_MODELS.flatMap((model, index) => {
    const points = predictions
      .filter((point) => point.modelType === model.key)
      .sort((left, right) => dateValue(left.date) - dateValue(right.date))
      .map(scalePoint);

    return points.length ? [{ ...model, color: MODEL_COLORS[index], points }] : [];
  });
  const yTicks = Array.from({ length: 5 }, (_, index) => ({
    value: yMax - (index / 4) * (yMax - yMin),
    y: padding.top + (index / 4) * innerHeight
  }));
  const xTicks = [minDate, minDate + dateSpan / 2, maxDate];

  return (
    <div className={`curve-chart comparison-chart ${loading ? "curve-chart--loading" : ""}`}>
      <div className="curve-chart__meta">
        <div>
          <p className="section-kicker">Observed to forecast</p>
          <h2>{maturityLabel} forward range</h2>
        </div>
        <p className="curve-chart__subtle">{predictions.length} forecasts · {actual.length} actual values</p>
      </div>

      <div className="comparison-chart__legend" aria-label="Chart legend">
        <span><i className="comparison-chart__swatch comparison-chart__swatch--actual" />Actual yield</span>
        {predictionSeries.map((series) => (
          <span key={series.key}><i className="comparison-chart__swatch" style={{ background: series.color }} />{series.label}</span>
        ))}
      </div>

      <div className="curve-chart__frame">
        <svg viewBox={`0 0 ${width} ${height}`} className="curve-chart__svg" role="img" aria-label={`${maturityLabel} forecasts compared with actual yields`}>
          {yTicks.map((tick) => (
            <g key={tick.y}>
              <line x1={padding.left} x2={width - padding.right} y1={tick.y} y2={tick.y} className="curve-chart__grid" />
              <text x={48} y={tick.y + 4} className="curve-chart__axis-label">{formatValue(tick.value)}</text>
            </g>
          ))}

          {actualPoints.length > 1 ? <path d={linePath(actualPoints)} className="comparison-chart__actual" /> : null}
          {actualPoints.map((point) => (
            <g key={`actual-${point.date}`}>
              <circle cx={point.x} cy={point.y} r="3" className="comparison-chart__actual-point" />
              <title>{`${displayDate(point.date)} actual: ${formatValue(point.value)}%`}</title>
            </g>
          ))}

          {predictionSeries.map((series) => (
            <g key={series.key} style={{ color: series.color }}>
              {series.points.length > 1 ? <path d={linePath(series.points)} className="comparison-chart__forecast" /> : null}
              {series.points.map((point) => (
                <g key={`${series.key}-${point.horizon}-${point.date}`}>
                  <circle cx={point.x} cy={point.y} r="6" className="comparison-chart__forecast-point" />
                  <title>{`${series.label}, ${point.horizon}d: ${formatValue(point.value)}% on ${displayDate(point.date)}`}</title>
                </g>
              ))}
            </g>
          ))}

          {xTicks.map((tick) => (
            <text key={tick} x={padding.left + ((tick - minDate) / dateSpan) * innerWidth} y={height - 22} className="curve-chart__maturity">
              {displayDate(new Date(tick).toISOString())}
            </text>
          ))}
        </svg>
        {loading ? <div className="curve-chart__loading">Loading comparison...</div> : null}
      </div>
    </div>
  );
}
