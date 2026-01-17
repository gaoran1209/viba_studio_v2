# Code Review Report - Viba Studio V2

**Date:** 2026-01-17
**Reviewer:** Trae AI

## 1. Executive Summary
The codebase is a full-stack application (React + Node.js) for AI image generation. While the functional core appears solid, there is a **Critical Security Vulnerability** regarding API Key management that must be addressed before production deployment. The architecture is clean, but input validation and error handling need strengthening.

## 2. Critical Security Issues (Must Fix)

### 🚨 API Key Exposure in Frontend
- **Location:** `frontend/vite.config.ts` and `frontend/services/geminiService.ts`
- **Issue:** The Google Gemini API Key is injected into the frontend bundle via `define`. This allows any user to inspect the JavaScript code and steal your API quota.
- **Recommendation:** Move all interaction with Google Gemini API to the backend. The frontend should send requests to the backend, which then proxies them to Google using the secure server-side environment variable.

### 🚨 Database SSL Verification Disabled
- **Location:** `backend/src/config/database.ts`
- **Issue:** `ssl: { rejectUnauthorized: false }` allows Man-in-the-Middle attacks.
- **Recommendation:** Enable `rejectUnauthorized: true` in production and provide the correct CA certificate (e.g., for Render/Supabase).

### ⚠️ JWT Storage
- **Location:** `frontend/contexts/AuthContext.tsx`
- **Issue:** JWTs are stored in `localStorage`, making them vulnerable to XSS attacks.
- **Recommendation:** Store tokens in `HttpOnly` `Secure` cookies.

## 3. Code Quality & Best Practices

### Backend
- **Input Validation:** `authController.ts` lacks strong validation for email formats and password complexity.
  - *Fix:* Use `zod` or `joi` for request validation.
- **Type Safety:** Usage of `any` in `authMiddleware.ts` and controllers reduces TypeScript's benefits.
  - *Fix:* Define `AuthRequest` extending `Request` to include `user` property.
- **Database Sync:** `sequelize.sync({ alter: true })` is used.
  - *Fix:* Use Sequelize Migrations for production to prevent data loss.

### Frontend
- **Business Logic:** `geminiService.ts` contains heavy business logic that belongs in the backend.
- **Hardcoded URLs:** `AuthContext.tsx` has a hardcoded fallback to `localhost:3001`.
  - *Fix:* Ensure `VITE_API_URL` is consistently used.

## 4. Performance Optimization
- **Parallel Generation:** The use of `Promise.all` in `generateDerivations` is good for performance.
- **Asset Optimization:** Ensure images are optimized before upload to save bandwidth (currently sending raw Base64).

## 5. Next Steps for Deployment
1. **Refactor Gemini Service:** Move logic to backend `generationController`.
2. **Environment Variables:** Securely configure `GEMINI_API_KEY` only on the backend server (Render).
3. **Database:** Initialize Supabase and obtain connection string.
