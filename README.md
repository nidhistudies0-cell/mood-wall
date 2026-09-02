# Mood Wall - ForkThis Project

A shared, anonymous wall where anyone can pin their current mood as a colored
sticky note. Built with React (Vite) on the frontend and Express on the
backend, storing notes in memory — no database setup.

## Project structure

```
vibe-check/
├── client/                     # React Single-Page Application (Vite)
│   ├── index.html              # HTML entry with Google Fonts (Archivo Black, Bricolage, JetBrains Mono)
│   ├── vite.config.js          # Vite configuration and /api proxy to localhost:4000
│   └── src/
│       ├── main.jsx            # React application entry point
│       ├── App.jsx             # Root layout shell & component orchestrator
│       ├── App.css             # Full Y2K Scrapbook design system, textures, and clip-paths
│       ├── config.js           # Shared constants (API_BASE, NOTE_LIFETIME_MS, POLL_INTERVAL_MS)
│       ├── mood/               # Mood domain logic & math
│       │   ├── moodData.js     # MOODS & REACTIONS data definitions
│       │   ├── moodResolver.js # moodByName() & backward-compatible alias table
│       │   └── moodStats.js    # computeTimeline, computeMoodBreakdown, formatClockTime
│       ├── hooks/              # Custom React hooks
│       │   ├── useUserIdentity.js # Manages persistent anonymous userId & reaction tracking
│       │   └── useNotes.js     # Handles note fetching, polling, posting, and reactions
│       └── components/
│           ├── ScrapbookDecor.jsx # Paper grain overlay, washi tapes, and stamp decals
│           ├── Timeline.jsx    # Torn-paper Mood Frequency chart board with binder clips
│           ├── Wall.jsx        # Note cards grid & 3-card pastel empty states
│           ├── NoteCard.jsx    # Individual scrapbook card variants, stamps, and stickers
│           ├── PostMoodModal.jsx # Sticky scrapbook modal for creating anonymous notes
│           └── ComposeBar.jsx  # Alternative inline compose interface
│
└── server/                     # Express REST API
    ├── index.js                # In-memory store, note pruning, reaction toggling, and endpoints
    └── package.json            # Server dependencies and start scripts
```

---

## Running Locally

You'll need two terminals — one for the backend server and one for the frontend client.

### 1. Start the Backend
```bash
cd server
npm install
npm run dev
```
> The API server runs on **http://localhost:4000** (using `node --watch index.js` for hot reloading).

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```
> The client runs on **http://localhost:5173** and proxies all `/api/*` requests to port `4000`.

Open [http://localhost:5173](http://localhost:5173) in your browser to view the live Mood Wall.

---

## Note Expiration & In-Memory Storage

Notes are stored in memory on the server with a lifetime of **5 hours** (`NOTE_LIFETIME_MS = 5 * 60 * 60 * 1000`). Expired notes are pruned automatically upon fetching and creation. No external database or setup is required.
