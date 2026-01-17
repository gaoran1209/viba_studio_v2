# Bug Fix Plan: ReferenceError config is not defined

The error `ReferenceError: config is not defined` occurs because `config` is being used in `DerivationView.tsx` (line 63) but it is not retrieved from the `useModelConfig` hook.

## 1. Fix Code
I have modified `frontend/views/DerivationView.tsx` to retrieve `config` from `useModelConfig`.

```typescript
export const DerivationView: React.FC = () => {
  const { t } = useLanguage();
  const { config } = useModelConfig(); // Added this line
  const [jobs, setJobs] = useState<Job[]>([]);
  // ...
```

## 2. Rebuild Frontend
After applying the fix, I will rebuild the frontend to ensure the error is resolved.

## 3. Redeploy
You will need to redeploy the frontend to Vercel for the fix to take effect in production.
