# Viba Studio V2 - Deployment Guide

This guide details how to deploy the Viba Studio V2 application to Vercel (Frontend), Render (Backend), and Supabase (Database).

## 1. Database Setup (Supabase)

1.  **Create Project**: Log in to Supabase and create a new project.
2.  **Get Credentials**: Go to **Settings** -> **Database**.
    *   Copy the **Connection String** (Node.js/Transaction Mode). It looks like:
        `postgresql://postgres:[PASSWORD]@db.[ref].supabase.co:5432/postgres`
    *   *Note*: Ensure you disable "Use connection pooling" if using Sequelize with SSL locally, or keep it enabled for production transaction pooling. Direct connection is usually fine for this scale.
3.  **Permissions**:
    *   The application uses Sequelize with `sync({ alter: true })`, so the database user needs `CREATE` and `ALTER` table permissions. The default `postgres` user has these.

## 2. Backend Deployment (Render)

The backend is a Node.js Express application handling Auth and AI Generation.

### Option A: Blueprints (Recommended)
1.  In Render Dashboard, go to **Blueprints**.
2.  Connect your repo.
3.  Render will detect `render.yaml`.
4.  **Important**: You must manually input the environment variables when prompted or in the dashboard after creation.

### Option B: Manual Web Service
1.  **New Web Service** -> Connect Repository.
2.  **Root Directory**: `backend`
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   `DATABASE_URL`: (From Supabase)
    *   `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -hex 32`).
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `PORT`: `3001` (Optional, Render sets this automatically).

## 3. Frontend Deployment (Vercel)

The frontend is a Vite + React application.

1.  **New Project** -> Import Repository.
2.  **Root Directory**: Select `frontend`.
3.  **Framework Preset**: Vite.
4.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://viba-studio-api.onrender.com/api/v1`).
        *   *Note*: Do NOT add a trailing slash.
5.  **Deploy**.

## 4. Verification Checklist

After deployment, perform these checks:

### API & Database
1.  **Health Check**: Visit `https://<BACKEND_URL>/health`. Should return `{"status":"ok"}`.
2.  **Auth**: Try to Register a new user. This verifies:
    *   Database connection (User creation).
    *   JWT generation.
3.  **AI Generation**:
    *   Upload an image in "Derivations".
    *   Click "Generate".
    *   This verifies:
        *   Frontend -> Backend connectivity (`VITE_API_URL`).
        *   Backend -> Gemini API connectivity (`GEMINI_API_KEY`).
        *   File handling (Base64 transfer).

## 5. Troubleshooting

*   **CORS Errors**: If Frontend cannot talk to Backend, check `backend/src/index.ts` or `cors` config. Ensure Vercel domain is allowed.
*   **Database Connection Error**: Check if `ssl: { rejectUnauthorized: false }` is needed for Supabase (it is currently enabled in code).
*   **Build Failures**: Check `package.json` dependencies.
