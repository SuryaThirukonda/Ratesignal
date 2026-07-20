import os
from dotenv import load_dotenv

import pandas as pd
import requests
import xgboost as xgb

load_dotenv()


matList = ["0Y1M", "0Y3M", "0Y6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"]
horizons = [1, 5, 20]
features = ["lag1", "lag2", "lag3", "lag4", "lag5"]
uploadUrl = "http://localhost:9000/api/predictions/batch/"


def loadData():
    df = pd.read_csv("backend\\data\\FRB_H15.csv").dropna()

    #rename columns
    df.rename(columns={"Series Description": "Date", "Market yield on U.S. Treasury securities at 1-month  constant maturity, quoted on investment basis": "0Y1M", "Market yield on U.S. Treasury securities at 3-month  constant maturity, quoted on investment basis": "0Y3M", "Market yield on U.S. Treasury securities at 6-month  constant maturity, quoted on investment basis": "0Y6M", "Market yield on U.S. Treasury securities at 1-year  constant maturity, quoted on investment basis": "1Y", "Market yield on U.S. Treasury securities at 2-year  constant maturity, quoted on investment basis": "2Y", "Market yield on U.S. Treasury securities at 3-year  constant maturity, quoted on investment basis": "3Y", "Market yield on U.S. Treasury securities at 5-year  constant maturity, quoted on investment basis": "5Y", "Market yield on U.S. Treasury securities at 7-year  constant maturity, quoted on investment basis": "7Y", "Market yield on U.S. Treasury securities at 10-year  constant maturity, quoted on investment basis": "10Y", "Market yield on U.S. Treasury securities at 20-year constant maturity, quoted on investment basis": "20Y", "Market yield on U.S. Treasury securities at 30-year  constant maturity, quoted on investment basis": "30Y"}, inplace=True)
    df.rename(columns={"Market yield on U.S. Treasury securities at 20-year  constant maturity, quoted on investment basis": "20Y"}, inplace=True)

    #dont make timeseries data for xgboost
    df["Date"] = pd.to_datetime(df["Date"])
    df = df[df["Date"] <= "2025-05-14"]
    df = df.reset_index(drop=True)
    return df


def createTable(df, mat, horizon):
    rows = []

    for i in range(4, len(df.index)-horizon):
        lag1 = df[mat].iloc[i]
        lag2 = df[mat].iloc[i-1]
        lag3 = df[mat].iloc[i-2]
        lag4 = df[mat].iloc[i-3]
        lag5 = df[mat].iloc[i-4]
        target = df[mat].iloc[i+horizon]
        rows.append([lag1, lag2, lag3, lag4, lag5, target])

    return pd.DataFrame(rows, columns=features + ["target"])


def createPredictions(df):
    dates = []

    #indexes for 20 rolling windows
    windowStarts = range(len(df) - 40, len(df) - 20)

    #create one model for each maturity, horizon, and window
    for mat in matList:
        tables = {}
        for horizon in horizons:
            tables[horizon] = createTable(df, mat, horizon)

        for start in windowStarts:
            asOfDate = df["Date"].iloc[start]

            for horizon in horizons:
                table = tables[horizon]
                trainEnd = start - horizon - 3
                model = xgb.XGBRegressor(
                    objective="reg:squarederror",
                    n_estimators=500,
                    learning_rate=0.02,
                    max_depth=3,
                    subsample=0.8,
                    colsample_bytree=0.8,
                    reg_lambda=5,
                    random_state=7
                )
                model.fit(table[features].iloc[:trainEnd], table["target"].iloc[:trainEnd])
                predicted = model.predict(table[features].iloc[[start - 4]])[0]

                dates.append({
                    "maturity": mat,
                    "asOfDate": asOfDate.strftime("%Y-%m-%d"),
                    "predictedDate": df["Date"].iloc[start + horizon].strftime("%Y-%m-%d"),
                    "value": float(predicted),
                    "modelType": "arXgboost",
                    "horizon": horizon
                })

    return dates


def uploadPredictions(dates):
    token = os.environ.get("RATESIGNAL_API_TOKEN")
    if not token:
        raise ValueError("RATESIGNAL_API_TOKEN is required")

    payload = {"items": dates}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(uploadUrl, json=payload, headers=headers)
    print(response.status_code)
    response.raise_for_status()


def main():
    df = loadData()
    dates = createPredictions(df)
    uploadPredictions(dates)


if __name__ == "__main__":
    main()
