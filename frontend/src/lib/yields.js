import { apiRequest } from "./api";

export const MATURITIES = [
  { key: "0Y1M", label: "1M" },
  { key: "0Y3M", label: "3M" },
  { key: "0Y6M", label: "6M" },
  { key: "1Y", label: "1Y" },
  { key: "2Y", label: "2Y" },
  { key: "3Y", label: "3Y" },
  { key: "5Y", label: "5Y" },
  { key: "7Y", label: "7Y" },
  { key: "10Y", label: "10Y" },
  { key: "20Y", label: "20Y" },
  { key: "30Y", label: "30Y" }
];

export const DATA_MAX_DATE = "2026-05-14";

export async function fetchYieldCurve(date, token) {
  const params = new URLSearchParams({
    dateMin: date,
    dateMax: date,
    sortByDate: "asc"
  });

  MATURITIES.forEach((maturity) => {
    params.append("maturity", maturity.key);
  });

  const records = await apiRequest(`/api/maturities?${params.toString()}`, { token });

  if (!Array.isArray(records)) {
    throw new Error("The maturities response was not an array.");
  }

  const recordByMaturity = new Map(records.map((record) => [record.maturity, record]));

  return MATURITIES.flatMap((maturity) => {
    const record = recordByMaturity.get(maturity.key);

    if (!record) {
      return [];
    }

    return [{
      maturity: maturity.key,
      label: maturity.label,
      value: Number(record.value),
      date: record.date
    }];
  });
}

export async function fetchMaturityHistory({ maturity, dateMin, dateMax, token }) {
  const params = new URLSearchParams({
    maturity,
    dateMin,
    dateMax,
    sortByDate: "asc"
  });

  const records = await apiRequest(`/api/maturities?${params.toString()}`, { token });

  if (!Array.isArray(records)) {
    throw new Error("The maturity history response was not an array.");
  }

  return records.map((record) => ({
    date: record.date,
    value: Number(record.value),
    maturity: record.maturity
  }));
}

export const PREDICTION_MODELS = [
  { key: "ar", label: "AR" },
  { key: "var", label: "VAR" },
  { key: "randomWalk", label: "Random walk" },
  { key: "arXgboost", label: "AR + XGBoost" },
  { key: "varXgboostMat", label: "VAR + XGBoost" }
];

export const PREDICTION_AVAILABILITY = {
  asOfDate: DATA_MAX_DATE,
  historyDateMin: "2026-04-17",
  predictedDateMin: "2026-05-15",
  predictedDateMax: "2026-06-11"
};

export async function fetchPredictions({
  maturity,
  asOfDate,
  predictedDateMin,
  predictedDateMax,
  modelType,
  horizon,
  token
}) {
  const params = new URLSearchParams({
    maturity,
    asOfDate,
    predictedDateMin,
    predictedDateMax,
    sortByDate: "asc"
  });

  const modelTypes = Array.isArray(modelType) ? modelType : [modelType];
  const horizons = Array.isArray(horizon) ? horizon : [horizon];

  modelTypes.forEach((model) => params.append("modelType", model));
  horizons.forEach((value) => params.append("horizon", String(value)));

  const records = await apiRequest(`/api/predictions?${params.toString()}`, { token });

  if (!Array.isArray(records)) {
    throw new Error("The predictions response was not an array.");
  }

  return records.map((record) => ({
    date: record.predictedDate,
    value: Number(record.value),
    maturity: record.maturity,
    asOfDate: record.asOfDate,
    modelType: record.modelType,
    horizon: record.horizon
  }));
}
