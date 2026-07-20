# Ratesignal

Ratesignal is an express.js + vite.js web application that displays historical Treasury yield curve data, as well as forecasts for 20 days in the future from different machine learning models. 

- cd backend 
- cp .env.example .env
- docker build -t rate-signal-backend -f dockerfile .
- docker run --env-file .env -p 9000:9000 rate-signal-backend\

- frontend
  - cd frontend
  - docker build -t rate-signal-frontend -f dockerfile .
  - docker run -p 5173:5173 rate-signal-frontend

full application
- npm run compose:up
- npm run compose:down

<img width="1917" height="1046" alt="image" src="https://github.com/user-attachments/assets/30dfb1bd-abb6-4697-a5d8-613cf8a5e92e" />
<img width="1917" height="1052" alt="image" src="https://github.com/user-attachments/assets/73b67379-38e8-4177-9414-786cedaf1c1d" />
<img width="1916" height="967" alt="image" src="https://github.com/user-attachments/assets/d83f207a-c089-4632-b21b-1e5634196688" />

