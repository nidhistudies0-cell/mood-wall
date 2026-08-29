# Vibe Check — Live Mood Wall

A shared, anonymous wall where anyone can pin their current mood as a colored
sticky note. Built with React (Vite) on the frontend and Express on the
backend, storing notes in memory — no database setup needed for a workshop.

## Project structure

```
vibe-check/
├── server/     Express API (in-memory notes store)
└── client/     React frontend (Vite)
```

## Running it locally

You'll need two terminals — one for the server, one for the client.

**1. Start the backend**
```bash
cd server
npm install
npm start
```
Runs on http://localhost:4000

**2. Start the frontend**
```bash
cd client
npm install
npm run dev
```
Runs on http://localhost:5173 and proxies `/api` requests to the backend.

Open http://localhost:5173 in your browser. Pin a note, react to notes, and
watch the wall update (it polls every 5 seconds).

## API

| Method | Route | Description |
|---|---|---|
| GET | `/api/notes` | List all active (non-expired) notes, newest first |
| POST | `/api/notes` | Create a note — body: `{ status, color }` |
| POST | `/api/notes/:id/react` | Add a reaction — body: `{ reaction: "fire" \| "laugh" \| "dead" }` |

Notes automatically drop off the wall 6 hours after being posted.

## Notes for workshop use

This is the clean, working baseline. Bugs haven't been planted yet — this
version is meant to be forked/copied, then have small intentional bugs
introduced for participants to find and fix via GitHub issues and PRs.
