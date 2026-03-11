

# Fix Congressional API Integration

## Problems Identified

1. **Representatives page returns empty results**: The `find-representatives` edge function fetches only 50 members total (no state filter), then filters client-side. With 535+ congress members, most states get zero results because their members aren't in the first 50 returned.

2. **Stale congress session**: All API calls default to Congress 118 (2023-2024, ended). The current congress is **119**. Bills shown are outdated.

3. **Health bills are mostly irrelevant**: The health-bills action fetches generic bills and filters by title keywords, returning veteran/military bills rather than actual health policy bills.

## Fixes

### 1. Fix `find-representatives` edge function
- Use the Congress API's `stateCode` query parameter for **server-side** filtering instead of fetching 50 random members and filtering client-side
- Increase limit to 100 to capture all members for large-delegation states
- URL: `/member?stateCode=MN&currentMember=true&limit=100`

### 2. Update `congress-api` edge function
- Change default congress from `118` to `119`
- For health-bills, use the Congress API's subject-based endpoint: `/bill/119?subject=Health` or keep keyword filtering but against congress 119

### 3. Update `useCongressApi.ts` hook
- Change default congress parameter from `'118'` to `'119'`

### 4. Update `DistrictDashboard.tsx`
- No code changes needed (already passes state to find-representatives)

### Files Modified
- `supabase/functions/find-representatives/index.ts` — add `stateCode` param
- `supabase/functions/congress-api/index.ts` — update default congress to 119
- `src/hooks/useCongressApi.ts` — update default congress to 119

