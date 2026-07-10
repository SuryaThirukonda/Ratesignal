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

export async function fetchYieldCurve(date) {
  const params = new URLSearchParams({
    dateMin: date,
    dateMax: date,
    sortByDate: "asc"
  });

  MATURITIES.forEach((maturity) => {
    params.append("maturity", maturity.key);
  });

  const records = await apiRequest(`/api/maturities?${params.toString()}`);

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
