# Ratesignal

- cd backend 
- cp .env.example .env
- docker build -t rate-signal-backend -f dockerfile .
- docker run --env-file .env -p 9000:9000 rate-signal-backend\
- 