EPG Fullstack Ready
===================

Quickstart (local):

Requirements:
- Node.js 18+
- npm

1) Backend
cd backend
npm install
cp .env.sample .env
# edit .env to change FEED URL if desired
npm start

Backend endpoints:
- GET /api/epg?date=YYYY-MM-DD
- GET /api/program/:id
- GET /api/refresh

2) Frontend
cd frontend
npm install
npm run dev
Open http://localhost:5173

Default feed: https://ext.greektv.app/epg/epg.xml
Hidden events stored in localStorage per date.
