# Frontend Routing Refactor Plan

To support independent URLs for each feature (e.g., `/tryon`, `/avatar`), I will refactor the frontend routing architecture.

## 1. Refactor `App.tsx`
- Replace the current monolithic `Dashboard` component with a `DashboardLayout`.
- Use `react-router-dom`'s `<Outlet />` to render child views.
- Configure the following route structure:
  - `/` -> Redirects to `/derivation`
  - `/derivation` -> `DerivationView`
  - `/avatar` -> `AvatarView`
  - `/tryon` -> `TryOnView` (Note: User requested `/tryon`, I will map `View.TRY_ON` to this)
  - `/swap` -> `SwapView`
  - `/prompts` -> `SystemPromptsView`

## 2. Implement `DashboardLayout`
- This component will wrap the `Sidebar` and `Header`.
- It will synchronize the URL path with the `Sidebar`'s active state.
- **Logic**:
  - `useLocation()` to determine the current `View` based on the URL.
  - `useNavigate()` to handle sidebar clicks and change the URL.

## 3. Component Updates
- **Sidebar**: No internal changes needed. It will continue to receive `currentView` and `onNavigate`, but `App.tsx` will pass a navigation handler instead of a state setter.
- **Header**: No internal changes needed. It will receive `currentView` derived from the URL.

## 4. Verification
- Verify accessing `/tryon` directly loads the Try On view.
- Verify clicking sidebar items updates the URL.
- Verify "Back" button works in browser.
