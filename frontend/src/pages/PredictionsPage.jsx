import { useState } from "react";
import { TimeSeriesChart } from "../components/TimeSeriesChart";
import { useAuth } from "../context/AuthContext";
import { fetchPredictions, MATURITIES, PREDICTION_MODELS } from "../lib/yields";

const DEFAULT_FORM = {
  maturity: "1Y",
  asOfDate: "2025-05-14",
  predictedDateMin: "2025-05-15",
  predictedDateMax: "2025-06-03",
  modelType: "ar",
  horizon: "1"
};

export function PredictionsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const maturityLabel = MATURITIES.find((item) => item.key === form.maturity)?.label ?? form.maturity;

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const data = await fetchPredictions({ ...form, horizon: Number(form.horizon), token });
      setSeries(data);
      setStatus("ready");
    } catch (requestError) {
      setSeries([]);
      setStatus("error");
      setError(requestError.message || "Unable to load predictions.");
    }
  }

  return (
    <div className="page-shell">
      <section className="dashboard-shell">
        <div className="dashboard-head">
          <div>
            <p className="section-kicker">Forward signal</p>
            <h1>{maturityLabel} predictions</h1>
            <p className="dashboard-copy">Inspect one model and horizon at a time as prediction data becomes available.</p>
          </div>
        </div>

        <form className="panel filter-form filter-form--prediction" onSubmit={handleSubmit}>
          <label className="field"><span>Maturity</span><select value={form.maturity} onChange={(event) => update("maturity", event.target.value)}>{MATURITIES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <label className="field"><span>Model</span><select value={form.modelType} onChange={(event) => update("modelType", event.target.value)}>{PREDICTION_MODELS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <label className="field"><span>Horizon</span><select value={form.horizon} onChange={(event) => update("horizon", event.target.value)}><option value="1">1 day</option><option value="5">5 days</option><option value="20">20 days</option></select></label>
          <label className="field"><span>As of</span><input type="date" value={form.asOfDate} onChange={(event) => update("asOfDate", event.target.value)} required /></label>
          <label className="field"><span>Prediction from</span><input type="date" value={form.predictedDateMin} onChange={(event) => update("predictedDateMin", event.target.value)} required /></label>
          <label className="field"><span>Prediction to</span><input type="date" value={form.predictedDateMax} onChange={(event) => update("predictedDateMax", event.target.value)} required /></label>
          <button className="submit-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Loading..." : "Load predictions"}</button>
        </form>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="dashboard-grid">
          <article className="panel panel--chart"><TimeSeriesChart title={`${maturityLabel} projected path`} eyebrow={`${form.modelType} · ${form.horizon}-day horizon`} data={series} loading={status === "loading"} /></article>
          <aside className="panel panel--summary">
            <p className="section-kicker">Prediction set</p>
            <div className="stat-grid">
              <div className="stat-tile"><span>Points</span><strong>{series.length}</strong></div>
              <div className="stat-tile"><span>As of</span><strong>{form.asOfDate}</strong></div>
              <div className="stat-tile"><span>Model</span><strong>{form.modelType}</strong></div>
              <div className="stat-tile"><span>Horizon</span><strong>{form.horizon}d</strong></div>
            </div>
            <p className="fineprint">This view queries <code>/api/predictions</code>; it will populate after your prediction seed data is loaded.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
