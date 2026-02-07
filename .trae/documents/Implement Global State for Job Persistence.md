# Frontend Optimization & Persistence Plan

To address your requirements for maintaining task history, adding localStorage persistence, and improving page load speed, I will execute the following:

## 1. Performance Optimization (Page Speed)
The "slow page open" issue is likely due to loading all view components at once.
- **Action**: Implement **Route-based Code Splitting** in `App.tsx`.
- **Method**: Use `React.lazy()` and `Suspense` to load `DerivationView`, `AvatarView`, `TryOnView`, and `SwapView` only when the user navigates to them. This will significantly reduce the initial bundle size and speed up the first paint.

## 2. State Management & Persistence
To keep tasks visible when switching tabs and persist them after refresh:
- **Centralize Types**: Move all `Job` interfaces to `frontend/types.ts` for consistent access.
- **Create `JobsContext`**:
  - Implement a global context to store jobs for all features.
  - **LocalStorage**: Auto-save job history to browser `localStorage`.
  - **Data Handling**:
    - Completed jobs (with remote URLs) will be fully restored.
    - *Note on Inputs*: Input files (blobs) for *pending* jobs are hard to persist reliably in `localStorage` due to size limits (5MB). I will implement a best-effort approach (convert to Base64) but may need to expire inputs if they are too large.

## 3. Refactor Views
I will update all four main views (`Derivation`, `Avatar`, `TryOn`, `Swap`) to:
- Remove local `useState` for jobs.
- Consume the `JobsContext` to read/write tasks.

## 4. Execution Order
1.  **Optimize Loading**: Modify `App.tsx` first to fix the speed issue.
2.  **Define Types**: Update `types.ts`.
3.  **Implement Context**: Create `JobsContext.tsx`.
4.  **Connect Views**: Update the view components one by one.
5.  **Verify & Deploy**: Build and verify the persistence and speed improvements.
