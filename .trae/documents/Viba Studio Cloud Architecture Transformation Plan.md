# Viba Studio Cloud Deployment Architecture Plan (v2)

Based on your feedback, I have updated the plan to include the **per-feature Gemini model configuration**.

## 1. Project Restructuring & Code Management
We will reorganize the current client-only project into a monorepo-style structure.
- **Directory Structure**:
  - `frontend/`: Move existing Vite project here.
  - `backend/`: Create new Express.js application here.
- **Version Control**:
  - Initialize Git repository.
  - Create `.gitignore` (handling node_modules, .env, etc.).
  - Establish `main`, `dev`, and `feature/*` branching strategy.

## 2. Frontend Enhancements (Vercel)
Refactor the existing frontend to support the new architecture and the requested model configuration feature.
- **New Feature: Granular Model Configuration**:
  - **UI Update**: Modify `SystemPromptsView` to replace read-only model labels with dropdown selectors.
  - **Supported Models**: `gemini-3-pro-preview`, `gemini-3.1-flash-image-preview`, `gemini-2.5-pro`, `gemini-2.5-pro-image`.
  - **Storage**: Persist model selections in `localStorage` (per feature: Derivation, Avatar, TryOn, Swap).
  - **Logic**: Update `geminiService.ts` to accept dynamic model names instead of hardcoded constants.
- **Authentication UI**:
  - Create `LoginPage` and `RegisterPage`.
  - Implement `AuthContext` to manage user session.
- **API Integration**:
  - Connect "History" and "Profile" features to the new backend.
  - Keep AI generation client-side (using user's key and new model config).

## 3. Backend Architecture (Node.js + Express on Render)
Build a robust REST API to handle user data and history.
- **Tech Stack**: Express.js, TypeScript, Sequelize (ORM), bcrypt.
- **Core Modules**:
  - **Auth**: JWT-based authentication (Login, Register, Password Reset).
  - **Database Connection**: Connect to Supabase PostgreSQL.
  - **Health Check**: `/health` endpoint.
  - **Error Handling**: Global error middleware.

## 4. Database Design (Supabase PostgreSQL)
Using Sequelize to define models and sync with your Supabase instance.
- **Tables**:
  - `Users`: `id`, `email`, `password_hash`, `is_verified`, `model_preferences` (optional sync), etc.
  - `GenerationHistory`: `id`, `user_id`, `type`, `input_params`, `output_url`, `created_at`.

## 5. Deployment & DevOps
- **Backend (Render)**: Create `render.yaml` and configure env vars.
- **Frontend (Vercel)**: Create `vercel.json` for routing.
- **Documentation**: Create `DEPLOYMENT.md` and updated `README.md`.

## 6. Implementation Steps
1.  **Restructure**: Move files to `frontend/`, init `backend/`.
2.  **Frontend Feature**: Implement the "System Prompts" model configuration first (as requested).
3.  **Backend Init**: Setup Express, TypeScript, and Sequelize.
4.  **Database**: Define models and run migrations.
5.  **API Dev**: Implement Auth and History endpoints.
6.  **Frontend Auth**: Add Login/Register pages and integrate.
7.  **Final Verification**: Test E2E flow.

Shall we proceed with this updated plan?
