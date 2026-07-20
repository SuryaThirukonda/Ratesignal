import os
from dotenv import load_dotenv

import pandas as pd
import requests

load_dotenv()

matList = ["0Y1M", "0Y3M", "0Y6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"]
horizons = [1, 5, 20]
modelType = "randomWalk"
uploadUrl = "http://localhost:9000/api/predictions/batch/"


def loadData():
    df = pd.read_csv("backend\\data\\FRB_H15.csv").dropna()

    #rename columns
    df.rename(columns={"Series Description": "Date", "Market yield on U.S. Treasury securities at 1-month  constant maturity, quoted on investment basis": "0Y1M", "Market yield on U.S. Treasury securities at 3-month  constant maturity, quoted on investment basis": "0Y3M", "Market yield on U.S. Treasury securities at 6-month  constant maturity, quoted on investment basis": "0Y6M", "Market yield on U.S. Treasury securities at 1-year  constant maturity, quoted on investment basis": "1Y", "Market yield on U.S. Treasury securities at 2-year  constant maturity, quoted on investment basis": "2Y", "Market yield on U.S. Treasury securities at 3-year  constant maturity, quoted on investment basis": "3Y", "Market yield on U.S. Treasury securities at 5-year  constant maturity, quoted on investment basis": "5Y", "Market yield on U.S. Treasury securities at 7-year  constant maturity, quoted on investment basis": "7Y", "Market yield on U.S. Treasury securities at 10-year  constant maturity, quoted on investment basis": "10Y", "Market yield on U.S. Treasury securities at 20-year constant maturity, quoted on investment basis": "20Y", "Market yield on U.S. Treasury securities at 30-year  constant maturity, quoted on investment basis": "30Y"}, inplace=True)
    df.rename(columns={"Market yield on U.S. Treasury securities at 20-year  constant maturity, quoted on investment basis": "20Y"}, inplace=True)

    #make index to datetime for timeseries
    df["Date"] = pd.to_datetime(df["Date"])
    df = df[df["Date"] <= "2025-05-14"]
    df.set_index("Date", inplace=True)
    return df


def createPredictions(df):
    dates = []

    #indexes for 20 rolling windows
    windowStarts = range(len(df) - 40, len(df) - 20)

    for start in windowStarts:
        asOfDate = df.index[start]

        #assume the previous day is the same value as today
        for mat in matList:
            current = df[mat].iloc[start]

            for horizon in horizons:
                dates.append({
                    "maturity": mat,
                    "asOfDate": asOfDate.strftime("%Y-%m-%d"),
                    "predictedDate": df.index[start + horizon].strftime("%Y-%m-%d"),
                    "value": float(current),
                    "modelType": modelType,
                    "horizon": horizon
                })

    return dates


def uploadPredictions(dates):
    token = os.getenv("RATESIGNAL_API_TOKEN")
    if not token:
        raise ValueError("RATESIGNAL_API_TOKEN is required")

    payload = {"items": dates}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(uploadUrl, json=payload, headers=headers)
    print(response.status_code, response.text)
    response.raise_for_status()


def main():
    df = loadData()
    dates = createPredictions(df)
    uploadPredictions(dates)


if __name__ == "__main__":
    main()
