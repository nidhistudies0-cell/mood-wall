# Mood Wall - ForkThis Project

A shared, anonymous wall where anyone can pin their current mood as a colored
sticky note. Built with React (Vite) on the frontend and Express on the
backend, storing notes in memory — no database setup.

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
    └── package.json           
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


### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the live Mood Wall.

---

## Note Expiration & In-Memory Storage

Notes are stored in memory on the server with a lifetime of **5 hours** (`NOTE_LIFETIME_MS = 5 * 60 * 60 * 1000`). Expired notes are pruned automatically upon fetching and creation. No external database or setup is required.
