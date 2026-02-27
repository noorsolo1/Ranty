# 🎙 Ranty — Voice Rant Analyzer

A voice-first emotional processing app where you record rants when triggered. The app transcribes audio in real-time, runs AI analysis via Gemini 1.5 Flash, and surfaces emotional patterns over time.

---

## Features

- **🎤 Voice Recording** — Tap the big red mic and rant. Live transcript appears as you speak.
- **🤖 AI Analysis** — Gemini 1.5 Flash detects emotions, trigger keywords, sentiment score, and writes a personalized insight for each rant.
- **📊 Dashboard** — Emotion frequency charts, trigger word cloud, 24-hour heatmap, and an AI-generated pattern summary.
- **🔒 Private & Multi-user** — JWT auth, each user sees only their own rants.
- **🎧 Audio Playback** — Recordings saved server-side and streamed back with range-request support.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, Recharts |
| Backend | Node.js, Express 4 |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (7d) + bcrypt |
| Voice | Web Speech API (live transcript) + MediaRecorder API |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Audio Storage | Multer → disk (`server/uploads/audio/`) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/noorsolo1/Ranty.git
cd Ranty
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

Create `server/.env`:

```env
PORT=3001
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

### 4. Seed the database (demo data)

```bash
cd server && npm run seed
```

This creates a demo user with 18 pre-analyzed rants.

| Field | Value |
|-------|-------|
| Email | `demo@rantapp.com` |
| Password | `demo1234` |

### 5. Run

```bash
# Terminal 1 — backend
cd server && npm start

# Terminal 2 — frontend
cd client && npm run dev
```

Visit **http://localhost:5173**

---

## Project Structure

```
Ranty/
├── server/
│   ├── index.js                # Express entry point
│   ├── .env                    # JWT_SECRET, GEMINI_API_KEY, PORT
│   ├── db/
│   │   ├── database.js         # better-sqlite3 singleton
│   │   ├── schema.js           # Table definitions
│   │   └── seed.js             # Demo user + 18 rants
│   ├── middleware/auth.js      # JWT verification
│   ├── routes/
│   │   ├── auth.js             # Register & login
│   │   ├── rants.js            # CRUD + audio streaming
│   │   └── analysis.js         # Aggregated stats + AI summary
│   └── services/
│       ├── gemini.js           # Gemini API prompts
│       └── audioStorage.js     # Multer config
│
└── client/
    └── src/
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── api/client.js           # Axios + 401 interceptor
        ├── hooks/
        │   ├── useSpeechRecognition.js
        │   └── useMediaRecorder.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── RecordPage.jsx      # Main mic UI
        │   ├── RantLogPage.jsx
        │   ├── RantDetailPage.jsx
        │   └── DashboardPage.jsx
        └── components/
            ├── layout/
            ├── record/
            ├── rants/
            └── dashboard/
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |

### Rants *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rants` | List rants (paginated, searchable) |
| POST | `/api/rants` | Create rant (multipart: transcript + audio) |
| GET | `/api/rants/:id` | Get single rant |
| DELETE | `/api/rants/:id` | Delete rant + audio file |
| GET | `/api/rants/:id/audio` | Stream audio |
| POST | `/api/rants/:id/analyze` | Re-trigger Gemini analysis |

### Analysis *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis/emotions` | Emotion frequency counts |
| GET | `/api/analysis/keywords` | Trigger keyword counts |
| GET | `/api/analysis/heatmap` | Rants by hour of day |
| GET | `/api/analysis/summary` | Cached AI pattern summary |
| POST | `/api/analysis/summary/refresh` | Force regenerate summary |

---

## Notes

- Live transcription requires **Chrome or Edge** (Firefox doesn't support Web Speech API)
- AI analysis runs asynchronously — the rant saves instantly and analysis appears within a few seconds
- Audio files are stored locally in `server/uploads/audio/` (gitignored)
- The database file `server/db/triggervault.db` is gitignored — run `npm run seed` after cloning
