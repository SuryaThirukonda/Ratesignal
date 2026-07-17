# Ratesignal

- cd backend 
- cp .env.example .env
- docker build -t rate-signal-backend -f dockerfile .
- docker run --env-file .env -p 9000:9000 rate-signal-backend\

- frontend
  - cd frontend
  - docker build -t rate-signal-frontend -f dockerfile .
  - docker run -p 5173:5173 rate-signal-frontend
