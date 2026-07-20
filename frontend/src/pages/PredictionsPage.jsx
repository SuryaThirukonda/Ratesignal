import { useState } from "react";
import { ForecastComparisonChart } from "../components/ForecastComparisonChart";
import { useAuth } from "../context/AuthContext";
import {
  DATA_MAX_DATE,
  fetchMaturityHistory,
  fetchPredictions,
  MATURITIES,
  PREDICTION_AVAILABILITY,
  PREDICTION_MODELS
} from "../lib/yields";

const HORIZONS = Array.from({ length: 20 }, (_, index) => index + 1);
const DEFAULT_FORM = {
  maturity: "1Y",
  modelTypes: PREDICTION_MODELS.map((model) => model.key),
  horizonMin: 1,
  horizonMax: 20
};

function horizonRange(min, max) {
  return Array.from({ length: Math.max(max - min + 1, 0) }, (_, index) => min + index);
}

export function PredictionsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [predictions, setPredictions] = useState([]);
  const [actual, setActual] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const maturityLabel = MATURITIES.find((item) => item.key === form.maturity)?.label ?? form.maturity;
  const selectedHorizons = horizonRange(form.horizonMin, form.horizonMax);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleModel(value) {
    setForm((current) => {
      const modelTypes = current.modelTypes.includes(value)
        ? current.modelTypes.filter((model) => model !== value)
        : [...current.modelTypes, value];

      return { ...current, modelTypes };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.modelTypes.length) {
      setError("Select at least one model.");
      return;
    }

    if (form.horizonMin > form.horizonMax) {
      setError("The starting horizon must be less than or equal to the ending horizon.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const [forecastData, actualData] = await Promise.all([
        fetchPredictions({
          maturity: form.maturity,
          asOfDate: PREDICTION_AVAILABILITY.asOfDate,
          predictedDateMin: PREDICTION_AVAILABILITY.predictedDateMin,
          predictedDateMax: PREDICTION_AVAILABILITY.predictedDateMax,
          modelType: form.modelTypes,
          horizon: selectedHorizons,
          token
        }),
        fetchMaturityHistory({
          maturity: form.maturity,
          dateMin: PREDICTION_AVAILABILITY.historyDateMin,
          dateMax: DATA_MAX_DATE,
          token
        })
      ]);

      setPredictions(forecastData);
      setActual(actualData);
      setStatus("ready");
    } catch (requestError) {
      setPredictions([]);
      setActual([]);
      setStatus("error");
      setError(requestError.message || "Unable to load the comparison.");
    }
  }

  return (
    <div className="page-shell">
      <section className="dashboard-shell">
        <div className="dashboard-head">
          <div>
            <p className="section-kicker">Forward signal</p>
            <h1>{maturityLabel} forecast lab</h1>
            <p className="dashboard-copy">Follow the observed yield into the next 20 business-day forecasts.</p>
          </div>
          <p className="availability-note">
            Latest actual <strong>{DATA_MAX_DATE}</strong> · Forecasts <strong>{PREDICTION_AVAILABILITY.predictedDateMin}</strong>–<strong>{PREDICTION_AVAILABILITY.predictedDateMax}</strong>
          </p>
        </div>

        <form className="panel comparison-controls" onSubmit={handleSubmit}>
          <div className="comparison-controls__range">
            <label className="field"><span>Maturity</span><select value={form.maturity} onChange={(event) => update("maturity", event.target.value)}>{MATURITIES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
            <label className="field"><span>Horizon from</span><select value={form.horizonMin} onChange={(event) => update("horizonMin", Number(event.target.value))}>{HORIZONS.map((horizon) => <option key={horizon} value={horizon}>Day {horizon}</option>)}</select></label>
            <label className="field"><span>Horizon to</span><select value={form.horizonMax} onChange={(event) => update("horizonMax", Number(event.target.value))}>{HORIZONS.map((horizon) => <option key={horizon} value={horizon}>Day {horizon}</option>)}</select></label>
          </div>

          <fieldset className="choice-fieldset">
            <legend>Forecast models</legend>
            <div className="choice-grid choice-grid--models">
              {PREDICTION_MODELS.map((model) => (
                <label className="choice-chip" key={model.key}>
                  <input type="checkbox" checked={form.modelTypes.includes(model.key)} onChange={() => toggleModel(model.key)} />
                  <span>{model.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="forecast-window" aria-label="Selected forecast window">
            <span>Selected window</span>
            <strong>{selectedHorizons.length} days</strong>
            <small>Day {form.horizonMin} through day {form.horizonMax}</small>
          </div>

          <button className="submit-button comparison-controls__submit" type="submit" disabled={status === "loading"}>{status === "loading" ? "Loading forecasts..." : "Load forecast range"}</button>
        </form>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="dashboard-grid dashboard-grid--comparison">
          <article className="panel panel--chart">
            <ForecastComparisonChart actual={actual} predictions={predictions} maturityLabel={maturityLabel} loading={status === "loading"} />
          </article>
          <aside className="panel panel--summary">
            <p className="section-kicker">Forecast set</p>
            <div className="stat-grid">
              <div className="stat-tile"><span>Forecast values</span><strong>{predictions.length}</strong></div>
              <div className="stat-tile"><span>Recent actuals</span><strong>{actual.length}</strong></div>
              <div className="stat-tile"><span>Models</span><strong>{form.modelTypes.length}</strong></div>
              <div className="stat-tile"><span>As of</span><strong>{PREDICTION_AVAILABILITY.asOfDate}</strong></div>
            </div>
            <p className="fineprint">The dark line shows the latest 20 observed values through May 14. Colored paths begin on the next business day and continue through the selected horizons.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
