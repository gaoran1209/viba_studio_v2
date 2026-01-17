# Viba Studio V2

A powerful AI Image Processing Studio supporting Derivation, Avatar Training, Virtual Try-On, and Face Swap.

## Architecture

This project is organized as a monorepo:

- **frontend/**: React + Vite + TypeScript application.
- **backend/**: Node.js + Express + Sequelize application.

## Features

- **AI Generation**: Powered by Google Gemini models.
- **Cloud Architecture**:
  - **Auth**: Email/Password registration & login (JWT).
  - **History**: Cloud storage of generation history.
  - **Database**: Supabase PostgreSQL.
  - **Deployment**: Vercel (Frontend) + Render (Backend).
- **Model Configuration**: Granular control over Gemini models per feature (Derivation, Avatar, etc.).

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Supabase)

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**:
   - Backend: Create `backend/.env` with `DATABASE_URL` and `JWT_SECRET`.
   - Frontend: Create `frontend/.env.local` with `VITE_API_URL`.

### Running Locally

Start both services:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud deployment instructions.
