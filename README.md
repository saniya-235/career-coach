# Pathfinder — AI Career Coach

A full-stack portfolio project: React frontend, FastAPI + PostgreSQL backend,
JWT auth, CRUD, dashboards, and three AI features (resume review, mock
interview coach, career chatbot) powered by a provider-agnostic AI layer
(Anthropic or OpenAI — swap with one env var).

```
career-coach/
├── backend/          FastAPI app, SQLAlchemy models, Alembic migrations
├── frontend/          React + Vite + Tailwind
└── docker-compose.yml  Local Postgres
```

## 1. Local setup

### Database
```bash
docker compose up -d          # starts Postgres on localhost:5432
```

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env: set ANTHROPIC_API_KEY or OPENAI_API_KEY, and AI_PROVIDER

alembic revision --autogenerate -m "init"
alembic upgrade head

uvicorn app.main:app --reload   # http://localhost:8000, docs at /docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173
```

Register a user in the UI, then explore the dashboard, resume review,
interview coach, and chat.

## 2. What's already built

- **Auth**: register/login with hashed passwords (bcrypt) and JWT bearer
  tokens; `ProtectedRoute` on the frontend, `get_current_user` dependency on
  the backend.
- **Database**: PostgreSQL via SQLAlchemy models (`User`, `Resume`,
  `InterviewSession`, `ChatMessage`) with Alembic migrations.
- **CRUD**: full create/read/update/delete for resumes; create/read for
  interview sessions and chat messages.
- **Dashboards**: a summary view showing counts across each feature.
- **AI features**, all going through `app/services/ai_provider.py` so the
  provider can be swapped without touching feature code:
  - *Resume review*: submit resume text, get structured AI feedback stored
    on the record.
  - *Interview coach*: role-specific mock interview, one question at a
    time, plus an overall readiness assessment at the end.
  - *Career chatbot*: multi-turn conversation with persisted history.

## 3. Suggested build order (if extending or re-deriving this yourself)

1. **Auth + React shell** — registration/login screens, JWT storage,
   protected routing. (done here)
2. **Backend + database** — FastAPI project structure, SQLAlchemy models,
   Alembic migrations, Postgres via Docker. (done here)
3. **CRUD + dashboards** — resource endpoints, list/detail/edit UI, a
   dashboard aggregating stats. (done here)
4. **AI features, one at a time** — build and test resume review fully
   before starting the interview coach; same for chat. Keep the AI-calling
   code behind one interface (see `ai_provider.py`) so trying a different
   model or provider is a one-line change.
5. **Deploy + document** — see below.

## 4. Deployment (next steps)

You said you want to build locally first — when you're ready to deploy:

- **Frontend**: any static host works well with Vite (Vercel, Netlify,
  Cloudflare Pages). Set `VITE_API_URL` to your backend's public URL as a
  build-time env var.
- **Backend**: Render, Railway, Fly.io, or a VPS with Docker all work for
  FastAPI + Postgres. Render's free Postgres + web service combo is the
  fastest path; a `Dockerfile` for the backend is a good next addition if
  you go the VPS/Fly.io route.
- **Environment variables**: never commit `.env` — set `SECRET_KEY`,
  `DATABASE_URL`, and your AI provider key directly in the host's dashboard.
- **CORS**: update `FRONTEND_ORIGIN` in the backend's env to your deployed
  frontend URL once you know it.
- **Migrations in production**: run `alembic upgrade head` as a release
  step (most PaaS platforms support a pre-deploy/release command).

## 5. Ideas for extending further (great for a portfolio narrative)

- Rate-limit AI endpoints per user to control API costs.
- Add resume file upload (PDF) with text extraction instead of paste-only.
- Stream chatbot responses token-by-token via SSE for a snappier feel.
- Add a "compare resume versions" view showing feedback over time.
- Write a few backend tests (pytest + httpx) for auth and CRUD — a small
  test suite is a strong signal in a portfolio repo.
