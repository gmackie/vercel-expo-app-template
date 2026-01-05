# QA Verification Checklist

Use this checklist when verifying a feature is complete and ready for release.

## Feature Information

- **Feature**: [Name]
- **Issue**: #[number]
- **Plan**: docs/ai/handoffs/{id}-plan.md
- **PR**: #[number]
- **Tester**: [Name/AI]
- **Date**: [YYYY-MM-DD]

## Acceptance Criteria Verification

From the feature plan, verify each criterion:

- [ ] Criterion 1: [Description] - PASS/FAIL
- [ ] Criterion 2: [Description] - PASS/FAIL
- [ ] Criterion 3: [Description] - PASS/FAIL

## Functional Testing

### Happy Path
- [ ] Primary user flow works as expected
- [ ] Data is saved correctly
- [ ] UI updates appropriately
- [ ] No console errors

### Edge Cases
- [ ] Empty states handled
- [ ] Maximum limits respected
- [ ] Invalid input rejected gracefully
- [ ] Concurrent access handled

### Error Handling
- [ ] Error messages are user-friendly
- [ ] Errors are logged to Sentry
- [ ] Recovery path exists
- [ ] No data corruption on error

## Cross-Platform Testing

### Web (Next.js)
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Chrome (responsive)
- [ ] Mobile Safari (responsive)

### Mobile (Expo) - if applicable
- [ ] iOS Simulator
- [ ] iOS Device
- [ ] Android Emulator
- [ ] Android Device

## Performance Testing

- [ ] Page/screen loads in < 2 seconds
- [ ] No janky animations
- [ ] No memory leaks (check React DevTools)
- [ ] API responses < 500ms

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus states visible

## Security Testing

- [ ] Auth required where expected
- [ ] No data leakage between users
- [ ] Input sanitization working
- [ ] No XSS vulnerabilities

## Integration Testing

- [ ] tRPC endpoints return expected data
- [ ] Database state correct after operations
- [ ] Third-party integrations working
- [ ] Analytics events firing

## Regression Testing

- [ ] Existing features still work
- [ ] No new console errors
- [ ] No new Sentry errors
- [ ] Related features unaffected

## Test Results Summary

| Category | Passed | Failed | Skipped |
|----------|--------|--------|---------|
| Acceptance Criteria | | | |
| Functional | | | |
| Cross-Platform | | | |
| Performance | | | |
| Accessibility | | | |
| Security | | | |
| Integration | | | |
| Regression | | | |

## Issues Found

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| 1 | | Critical/High/Medium/Low | Open/Fixed |
| 2 | | | |

## Recommendation

- [ ] **APPROVED** - Ready for release
- [ ] **APPROVED WITH NOTES** - Minor issues, can release
- [ ] **NOT APPROVED** - Blocking issues must be fixed

## Notes

[Additional observations, concerns, or recommendations]

---

**Signed off by**: [Name]
**Date**: [YYYY-MM-DD]
