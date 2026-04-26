## Summary

- 

## Verification

- [ ] `npm run format:check` in `apps/frontend`
- [ ] `npm run lint` in `apps/frontend`
- [ ] relevant tests pass

## Architecture Checklist

- [ ] no imports from `components/*` inside `stores/*`
- [ ] shared types used by store/hooks/components live in `src/types/*`
- [ ] shared domain logic is not duplicated across feature folders
