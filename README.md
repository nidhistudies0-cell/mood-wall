# Mood Wall

A shared, anonymous wall where anyone can pin their current mood as a colored
sticky note. Built with React (Vite) on the frontend and Express on the
backend, with notes persisted in Postgres and identity handled via
server-issued session cookies.

## Project structure

```
mood-wall/
├── client/                     
│   ├── index.html              
│   ├── vite.config.js          
│   └── src/
│       ├── main.jsx            
│       ├── App.jsx             
│       ├── App.css             
│       ├── config.js           
│       ├── mood/               
│       │   ├── moodData.js     
│       │   ├── moodResolver.js 
│       │   └── moodStats.js    
│       ├── hooks/              
│       │   ├── useUserIdentity.js 
│       │   └── useNotes.js     
│       └── components/
│           ├── ScrapbookDecor.jsx 
│           ├── Timeline.jsx    
│           ├── Wall.jsx        
│           ├── NoteCard.jsx   
│           ├── PostMoodModal.jsx 
│           └── ComposeBar.jsx  
│
└── server/                     
    ├── index.js                
    ├── db.js                   
    ├── migrations/
    │   └── 001_init.sql        
    ├── .env                    (not committed — see Setup)
    └── package.json           
```

---

## Prerequisites

- Node.js
- PostgreSQL running locally (Homebrew, Docker, or otherwise)

---

## Setup

### 1. Create the database

```bash
createdb moodwall
```

### 2. Apply the schema

```bash
psql "postgresql://<your-username>@localhost:5432/moodwall" -f server/migrations/001_init.sql
```

### 3. Configure environment variables

Create `server/.env`:

```bash
DATABASE_URL=postgresql://<your-username>@localhost:5432/moodwall
SESSION_SECRET=<a long random string>
PORT=4000
```

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

---

## Running Locally

You'll need two terminals — one for the backend server and one for the frontend client.

### 1. Start the Backend
```bash
cd server
npm run dev
```

### 2. Start the Frontend
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the live Mood Wall.

---

## Data & Identity

**Notes** are stored in Postgres (`notes` table) with a lifetime of **5 hours**.
Expired notes are filtered out on read; nothing needs to be manually pruned.

**Reactions** are tracked per-session in the `note_reactions` table, keyed by
a server-issued session ID (`req.session.id`) — not a client-supplied value.
Sessions are stored in Postgres via `connect-pg-simple` (`user_sessions`
table, created automatically) and identified to the browser via an `httpOnly`
cookie, so reaction identity can't be spoofed by clearing `localStorage`.

No user accounts or login are required — sessions are anonymous and scoped
to the browser/cookie only.

---
