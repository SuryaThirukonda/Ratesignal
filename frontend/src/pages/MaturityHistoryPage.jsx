import { useState } from "react";
import { TimeSeriesChart } from "../components/TimeSeriesChart";
import { useAuth } from "../context/AuthContext";
import { fetchMaturityHistory, MATURITIES } from "../lib/yields";

const DEFAULT_FORM = { maturity: "1Y", dateMin: "2019-01-02", dateMax: "2025-05-14" };

function formatValue(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "--";
}

export function MaturityHistoryPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const selectedLabel = MATURITIES.find((item) => item.key === form.maturity)?.label ?? form.maturity;
  const latest = series.at(-1)?.value;
  const change = series.length > 1 ? series.at(-1).value - series[0].value : null;

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const data = await fetchMaturityHistory({ ...form, token });
      setSeries(data);
      setStatus("ready");
    } catch (requestError) {
      setSeries([]);
      setStatus("error");
      setError(requestError.message || "Unable to load maturity history.");
    }
  }

  return (
    <div className="page-shell">
      <section className="dashboard-shell">
        <div className="dashboard-head">
          <div>
            <p className="section-kicker">Historical signal</p>
            <h1>{selectedLabel} yield history</h1>
            <p className="dashboard-copy">Follow one Treasury maturity across any available date window.</p>
          </div>
        </div>

        <form className="panel filter-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Maturity</span>
            <select value={form.maturity} onChange={(event) => update("maturity", event.target.value)}>
              {MATURITIES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </label>
          <label className="field"><span>From</span><input type="date" value={form.dateMin} onChange={(event) => update("dateMin", event.target.value)} required /></label>
          <label className="field"><span>To</span><input type="date" value={form.dateMax} onChange={(event) => update("dateMax", event.target.value)} required /></label>
          <button className="submit-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Loading..." : "Load history"}</button>
        </form>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="dashboard-grid">
          <article className="panel panel--chart"><TimeSeriesChart title={`${selectedLabel} across time`} eyebrow="Historical yield" data={series} loading={status === "loading"} /></article>
          <aside className="panel panel--summary">
            <p className="section-kicker">Window readout</p>
            <div className="stat-grid">
              <div className="stat-tile"><span>Observations</span><strong>{series.length}</strong></div>
              <div className="stat-tile"><span>Latest</span><strong>{formatValue(latest)}</strong></div>
              <div className="stat-tile"><span>Change</span><strong>{change === null ? "--" : formatValue(change)}</strong></div>
              <div className="stat-tile"><span>Selected</span><strong>{selectedLabel}</strong></div>
            </div>
            <p className="fineprint">Filters map directly to <code>/api/maturities</code>.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
