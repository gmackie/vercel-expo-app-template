# Release Checklist

Use this checklist before deploying to staging or production.

## Release Information

- **Version**: [X.Y.Z]
- **Release Date**: [YYYY-MM-DD]
- **Release Manager**: [Name/AI]
- **Type**: [ ] Major [ ] Minor [ ] Patch [ ] Hotfix

## Pre-Release Checks

### Code Quality
- [ ] All PRs merged to release branch
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] No critical Sentry errors in staging

### Testing
- [ ] QA verification complete for all features
- [ ] Regression tests passed
- [ ] Performance acceptable
- [ ] No blocking bugs

### Documentation
- [ ] CHANGELOG updated
- [ ] API documentation updated (if needed)
- [ ] User-facing docs updated (if needed)
- [ ] Migration guide ready (if breaking changes)

### Database
- [ ] Migrations tested in staging
- [ ] Rollback plan documented
- [ ] Data backups verified
- [ ] No data loss risk

## Environment Preparation

### Staging
- [ ] Environment variables set
- [ ] Feature flags configured
- [ ] Third-party services ready
- [ ] SSL certificates valid

### Production
- [ ] Environment variables set
- [ ] Feature flags configured
- [ ] Third-party services ready
- [ ] SSL certificates valid
- [ ] CDN cache strategy planned

## Deployment Steps

### Web (Vercel)

1. [ ] Merge release branch to main
2. [ ] Verify Vercel deployment triggered
3. [ ] Monitor deployment progress
4. [ ] Verify deployment successful
5. [ ] Run smoke tests on production URL

```bash
# Manual deployment (if needed)
vercel --prod
```

### Mobile (EAS) - if applicable

1. [ ] Update version in app.config.js
2. [ ] Build production app
   ```bash
   pnpm eas:prod --platform all
   ```
3. [ ] Submit to app stores
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```
4. [ ] Monitor review status

## Post-Deployment Verification

### Immediate (0-15 min)
- [ ] Application accessible
- [ ] Login/signup working
- [ ] Core features functional
- [ ] No new errors in Sentry
- [ ] No error spike in logs

### Short-term (15-60 min)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify analytics events
- [ ] Test payment flows (if changed)

### Extended (1-24 hours)
- [ ] User feedback monitoring
- [ ] Error trend analysis
- [ ] Performance baseline established
- [ ] Support ticket review

## Rollback Plan

If critical issues discovered:

### Web
```bash
# Revert to previous deployment
vercel rollback
```

### Mobile
- iOS: Request expedited review for hotfix
- Android: Stage rollout, halt if issues

### Database
```bash
# Rollback migration (if applicable)
pnpm db:rollback
```

## Communication

### Internal
- [ ] Notify team of deployment
- [ ] Update status page (if applicable)
- [ ] Post in #releases channel

### External (if applicable)
- [ ] Publish release notes
- [ ] Notify affected users
- [ ] Update status page

## Release Artifacts

Create `docs/ai/releases/{date}-{version}.md`:

```markdown
# Release: v{version}

**Date**: {YYYY-MM-DD}
**Type**: Major/Minor/Patch

## Changes
- Feature: [Description] (#123)
- Fix: [Description] (#124)

## Migration Notes
[Any required actions]

## Known Issues
[Any known limitations]

## Metrics
- Build time: X min
- Deploy time: X min
- Bundle size: X KB (delta: +/- X)
```

## Sign-off

- [ ] **Engineering Lead**: [Name] - Approved
- [ ] **QA Lead**: [Name] - Approved
- [ ] **Product Owner**: [Name] - Approved (if major release)

---

**Release completed by**: [Name]
**Completion time**: [YYYY-MM-DD HH:MM]
