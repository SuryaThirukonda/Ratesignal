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
  const points = await Promise.all(
    MATURITIES.map(async (maturity) => {
      const params = new URLSearchParams({
        date,
        maturity: maturity.key
      });

      const point = await apiRequest(`/api/maturities?${params.toString()}`);

      return {
        maturity: maturity.key,
        label: maturity.label,
        value: Number(point.value),
        date: point.date
      };
    })
  );

  return points;
}
