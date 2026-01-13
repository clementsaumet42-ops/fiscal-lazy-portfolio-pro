# ESLint Errors - Roadmap for Fixes

## Context
The Vercel build was temporarily configured to skip ESLint errors to unblock deployments. This document outlines the errors that need to be fixed and provides guidance on how to address them.

## Current Configuration
- `frontend/next.config.js` has `eslint.ignoreDuringBuilds: true` (TEMPORARY)
- TypeScript type checking is still enabled
- Developers can run `npm run lint` locally to see all errors

## Error Summary (200+ total)

### 1. Unescaped Quotes in JSX (85 errors - 42% of total)
**Type**: `react/no-unescaped-entities`
**Examples**: 
- `'` characters in JSX text should be escaped as `&apos;` or `&#39;`
- `"` characters should be escaped as `&quot;` or `&#34;`

**Quick Fix Strategy**:
```bash
# Can be mostly automated with find/replace in JSX text
# Replace: >{text with '}<
# With: >{text with &apos;}<
```

**Files Affected**: Most `.tsx` files across `app/client/` directory

---

### 2. TypeScript `any` Type Usage (66 errors - 33% of total)
**Type**: `@typescript-eslint/no-explicit-any`
**Impact**: Medium - reduces type safety

**Recommended Approach**:
1. **Phase 1**: Add proper types for function parameters and return values
2. **Phase 2**: Create proper interfaces for complex objects
3. **Phase 3**: Use generics where appropriate

**Example Fix**:
```typescript
// Before
const handleData = (data: any) => { ... }

// After
interface DataType {
  id: string;
  value: number;
  // ... other fields
}
const handleData = (data: DataType) => { ... }
```

---

### 3. Unused Variables/Imports (20+ errors - 10% of total)
**Type**: `@typescript-eslint/no-unused-vars`
**Impact**: Low - code cleanliness

**Common Cases**:
- Unused imports: `Legend`, `TrendingUp`, `DollarSign`, `CartesianGrid`, etc.
- Unused variables: `formatCurrency`, `formatPercentage`, `validateAllocation`
- Unused parameters: `index` in map functions

**Quick Fix**: Simply remove the unused imports/variables

---

### 4. Empty Interface Declarations (3 errors)
**Type**: `@typescript-eslint/no-empty-object-type`
**Files**: 
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/textarea.tsx`

**Fix**: Either remove the interface or add a comment explaining why it's empty

---

### 5. React Hooks Dependencies (6 warnings)
**Type**: `react-hooks/exhaustive-deps`
**Impact**: Medium - could cause stale closures or infinite loops

**Files**:
- `app/client/backtest/page.tsx`
- `app/client/optimisation/page.tsx`
- `app/client/import-releves/page.tsx`
- `app/etfs/[isin]/page.tsx`
- `app/etfs/page.tsx`

**Fix**: Either add missing dependencies or use `useCallback`/`useMemo` appropriately

---

## Recommended Fix Order

### Priority 1: Quick Wins (1-2 hours)
1. ✅ Remove unused imports and variables (~20 fixes)
2. ✅ Fix empty interfaces (3 fixes)

### Priority 2: Automated Fixes (2-3 hours)
3. ✅ Fix unescaped quotes in JSX using find/replace (85 fixes)
   - Can use a script or editor's find/replace in multiple files

### Priority 3: Type Safety (4-6 hours)
4. ✅ Add proper types to replace `any` (66 fixes)
   - Focus on most-used functions first
   - Create shared interfaces for common data structures

### Priority 4: React Best Practices (2-3 hours)
5. ✅ Fix React Hooks dependencies (6 warnings)
   - Review each case individually
   - Test to ensure no infinite loops

---

## Automation Scripts

### Script 1: Fix Unescaped Apostrophes
```bash
# Find all JSX files with unescaped apostrophes
cd frontend
find app -name "*.tsx" -exec sed -i "s/>{([^<]*)'\([^<]*\)</>\1\&apos;\2</g" {} \;
```

### Script 2: List Unused Imports
```bash
# Run ESLint and filter for unused variable errors
npm run lint 2>&1 | grep "is defined but never used" | sort | uniq
```

---

## Testing Strategy

After fixing errors:
1. Run `npm run lint` to verify fixes
2. Run `npm run build` to ensure no build errors
3. Test affected pages in development (`npm run dev`)
4. Remove `eslint.ignoreDuringBuilds: true` from `next.config.js`
5. Run final build to confirm ESLint passes

---

## Notes

- **Do NOT** disable ESLint rules globally
- **Do NOT** use `// eslint-disable-next-line` unless absolutely necessary
- Fix the root cause instead of suppressing warnings
- Consider setting up pre-commit hooks to prevent new ESLint errors

---

## Timeline Estimate

- **Total Effort**: 10-15 hours
- **Can be split across multiple PRs**
- **Suggested approach**: Fix by file/directory to minimize conflicts

---

## Related Files

- Configuration: `frontend/next.config.js` (contains temporary workaround)
- ESLint Config: `frontend/.eslintrc.json`
- TypeScript Config: `frontend/tsconfig.json`

---

## Success Criteria

✅ All ESLint errors fixed
✅ `npm run lint` passes with 0 errors
✅ `npm run build` succeeds with ESLint enabled
✅ Remove `eslint.ignoreDuringBuilds: true` from config
✅ Vercel deployment succeeds with ESLint checks enabled
