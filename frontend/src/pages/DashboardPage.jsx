import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DatePicker } from "../components/DatePicker";
import { CurveChart } from "../components/CurveChart";
import { fetchYieldCurve } from "../lib/yields";

const DEFAULT_DATE = "2019-01-02";

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

function computeStats(points) {
  if (!points.length) {
    return null;
  }

  const values = points.map((point) => point.value);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pointByMaturity = new Map(points.map((point) => [point.maturity, point]));
  const spread10Y2Y =
    (pointByMaturity.get("10Y")?.value ?? 0) - (pointByMaturity.get("2Y")?.value ?? 0);

  return {
    average,
    min,
    max,
    spread10Y2Y
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [draftDate, setDraftDate] = useState(DEFAULT_DATE);
  const [activeDate, setActiveDate] = useState(DEFAULT_DATE);
  const [curve, setCurve] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadCurve(date) {
    setStatus("loading");
    setError("");

    try {
      const points = await fetchYieldCurve(date);
      setCurve(points);
      setActiveDate(date);
      setStatus("ready");
    } catch (requestError) {
      setCurve([]);
      setStatus("error");
      setError(requestError.message || "Unable to load the selected date.");
    }
  }

  useEffect(() => {
    loadCurve(DEFAULT_DATE);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    loadCurve(draftDate);
  }

  const stats = computeStats(curve);

  return (
    <div className="page-shell">
      <section className="dashboard-shell">
        <div className="dashboard-head">
          <div>
            <p className="section-kicker">Curve view</p>
            <h1>Ratesignal</h1>
            <p className="dashboard-copy">
              Hi{user?.name ? `, ${user.name}` : ""}. Pick a date and load one curve at a time.
            </p>
          </div>
        </div>

        <div className="dashboard-controls panel">
          <form className="date-form" onSubmit={handleSubmit}>
            <DatePicker label="As of date" value={draftDate} onChange={setDraftDate} />

            <button type="submit" className="submit-button" disabled={status === "loading"}>
              {status === "loading" ? "Loading..." : "Load curve"}
            </button>
          </form>

          <p className="fineprint">
            Each curve is assembled from the 11 maturities in the seed set.
          </p>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="dashboard-grid">
          <article className="panel panel--chart">
            <CurveChart date={activeDate} data={curve} loading={status === "loading"} />
          </article>

          <aside className="panel panel--summary">
            <p className="section-kicker">Snapshot</p>
            <div className="stat-grid">
              <div className="stat-tile">
                <span>Date</span>
                <strong>{activeDate}</strong>
              </div>
              <div className="stat-tile">
                <span>Points</span>
                <strong>{curve.length}</strong>
              </div>
              <div className="stat-tile">
                <span>Average</span>
                <strong>{stats ? formatNumber(stats.average) : "--"}</strong>
              </div>
              <div className="stat-tile">
                <span>Range</span>
                <strong>
                  {stats ? `${formatNumber(stats.min)} - ${formatNumber(stats.max)}` : "--"}
                </strong>
              </div>
              <div className="stat-tile">
                <span>10Y - 2Y</span>
                <strong>{stats ? formatNumber(stats.spread10Y2Y) : "--"}</strong>
              </div>
            </div>

            <div className="quote-grid">
              {curve.map((point) => (
                <div key={point.maturity} className="quote-chip">
                  <span>{point.label}</span>
                  <strong>{formatNumber(point.value)}</strong>
                </div>
              ))}
            </div>

            <p className="fineprint">
              Source data is fetched from <code>/api/maturities</code> for the selected date.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
