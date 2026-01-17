# Deployment Guide

This project consists of a **Frontend** (React/Vite) and a **Backend** (Node/Express).

## Prerequisites

- **GitHub Account**: For version control.
- **Vercel Account**: For frontend deployment.
- **Render Account**: For backend deployment.
- **Supabase Account**: For the database.

## 1. Database Setup (Supabase)

1. Create a new project in Supabase.
2. Get the connection string from Settings -> Database -> Connection String (Node.js).
3. It should look like: `postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres`.
4. The backend will automatically create tables (`users`, `generation_history`) on first startup.

## 2. Backend Deployment (Render)

1. Connect your GitHub repository to Render.
2. Click **New +** -> **Web Service**.
3. Select your repository.
4. **Root Directory**: `backend`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: A secure random string for tokens.
   - `PORT`: `3001` (or let Render assign it, code handles `process.env.PORT`).

Alternatively, use the provided `render.yaml` blueprint.

## 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Import the project.
3. **Root Directory**: `frontend` (Edit -> Select `frontend` folder).
4. **Framework Preset**: Vite (should detect automatically).
5. **Environment Variables**:
   - `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://viba-studio-api.onrender.com/api/v1`).
   - `VITE_GEMINI_API_KEY`: (Optional) If you want a default key, otherwise users provide their own.

## 4. Local Development

1. **Backend**:
   ```bash
   cd backend
   cp .env.example .env # Set your DB URL
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Access Frontend at `http://localhost:3000`.
