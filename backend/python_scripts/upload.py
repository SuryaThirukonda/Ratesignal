import requests
import pandas as pd
import json
import time

df = pd.read_csv("backend\\data\\FRB_H15.csv").dropna()

df.rename(columns={"Series Description": "Date", "Market yield on U.S. Treasury securities at 1-month  constant maturity, quoted on investment basis": "0Y1M", "Market yield on U.S. Treasury securities at 3-month  constant maturity, quoted on investment basis": "0Y3M", "Market yield on U.S. Treasury securities at 6-month  constant maturity, quoted on investment basis": "0Y6M", "Market yield on U.S. Treasury securities at 1-year  constant maturity, quoted on investment basis": "1Y", "Market yield on U.S. Treasury securities at 2-year  constant maturity, quoted on investment basis": "2Y", "Market yield on U.S. Treasury securities at 3-year  constant maturity, quoted on investment basis": "3Y", "Market yield on U.S. Treasury securities at 5-year  constant maturity, quoted on investment basis": "5Y", "Market yield on U.S. Treasury securities at 7-year  constant maturity, quoted on investment basis": "7Y", "Market yield on U.S. Treasury securities at 10-year  constant maturity, quoted on investment basis": "10Y", "Market yield on U.S. Treasury securities at 20-year constant maturity, quoted on investment basis": "20Y", "Market yield on U.S. Treasury securities at 30-year  constant maturity, quoted on investment basis": "30Y"}, inplace=True)
df.rename(columns={"Market yield on U.S. Treasury securities at 20-year  constant maturity, quoted on investment basis": "20Y"}, inplace=True)
df = df.reset_index(drop=True)

print(df.head())


maturities = []
matList = ["0Y1M", "0Y3M", "0Y6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"]

for index,rows in df.iterrows():
    #Date for the current row
    date = rows["Date"]
    

    #loop through columns after date
    for i in range(len(matList)+1):
        if (i ==0):
            continue
        mat = matList[i-1]

        value = float(rows[mat])
        maturity = str(mat)
        date = str(date)

        payload = {
            "maturity": maturity,
            "date": date,
            "value":value
        }

        response = requests.post("http://localhost:9000/api/maturities/",json = payload)
        print(response.status_code)
        time.sleep(0.01)



