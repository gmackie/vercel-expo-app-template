# Security Checklist

Use this checklist during code review and before releases.

## Authentication & Authorization

### Clerk Integration
- [ ] All protected routes require authentication
- [ ] Clerk middleware configured correctly
- [ ] Session handling secure
- [ ] Logout clears all tokens

### Authorization
- [ ] Role-based access control implemented
- [ ] Users can only access their own data
- [ ] Admin functions properly restricted
- [ ] API endpoints verify permissions

### Multi-tenancy (if applicable)
- [ ] Team/org isolation enforced
- [ ] No cross-tenant data leakage
- [ ] Invitations properly scoped

## Data Protection

### Input Validation
- [ ] All user input validated (Zod schemas)
- [ ] File uploads restricted (type, size)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)

### Sensitive Data
- [ ] Passwords never logged
- [ ] PII minimized in logs
- [ ] Sensitive data encrypted at rest
- [ ] API keys not in client bundle

### Data Transmission
- [ ] HTTPS enforced
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] CORS properly configured
- [ ] No sensitive data in URLs

## Secrets Management

### Environment Variables
- [ ] No secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Only `.env.example` committed (no real values)
- [ ] Production secrets in secure vault

### API Keys
- [ ] Keys rotated regularly
- [ ] Minimal permissions (principle of least privilege)
- [ ] Separate keys per environment
- [ ] Leaked keys revoked immediately

## Infrastructure Security

### Vercel
- [ ] Environment variables set per environment
- [ ] Preview deployments protected (if needed)
- [ ] Deployment protection enabled

### Database (Neon)
- [ ] Connection string secure
- [ ] SSL required
- [ ] IP restrictions (if applicable)
- [ ] Regular backups enabled

### Third-Party Services
- [ ] Stripe webhook signature verified
- [ ] Clerk webhook signature verified
- [ ] Pusher authentication secure
- [ ] All webhooks use HTTPS

## Client-Side Security

### Web
- [ ] Content Security Policy (CSP) configured
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Referrer-Policy configured

### Mobile
- [ ] Sensitive data not in AsyncStorage (use SecureStore)
- [ ] Certificate pinning (if high-security)
- [ ] Jailbreak/root detection (if needed)
- [ ] Secure deep link handling

## Error Handling

### Error Messages
- [ ] No stack traces to users
- [ ] No sensitive info in errors
- [ ] Generic messages for auth failures
- [ ] Detailed errors only in logs

### Logging
- [ ] Security events logged
- [ ] Failed auth attempts tracked
- [ ] Anomalous activity alerting
- [ ] Logs don't contain secrets

## Dependency Security

### Packages
- [ ] No known vulnerabilities (`pnpm audit`)
- [ ] Dependencies up to date
- [ ] Lockfile committed
- [ ] No unnecessary dependencies

### Supply Chain
- [ ] Trusted package sources only
- [ ] GitHub Actions pinned to SHA
- [ ] No `eval()` or dynamic code execution

## Compliance (if applicable)

### GDPR
- [ ] Data processing documented
- [ ] User consent obtained
- [ ] Data deletion supported
- [ ] Data export available

### SOC 2 / SOX
- [ ] Audit logging enabled
- [ ] Access controls documented
- [ ] Change management process
- [ ] Incident response plan

## Security Testing

### Manual
- [ ] Attempted unauthorized access
- [ ] Tested privilege escalation
- [ ] Verified data isolation
- [ ] Checked error handling

### Automated
- [ ] Dependency audit passed
- [ ] SAST scan (if configured)
- [ ] No hardcoded secrets detected

## Incident Response

### Preparation
- [ ] Security contact defined
- [ ] Incident response plan exists
- [ ] Key rotation procedure documented
- [ ] Backup restoration tested

### Monitoring
- [ ] Sentry alerts configured
- [ ] Unusual activity detection
- [ ] Failed auth monitoring
- [ ] Rate limiting in place

## Review Sign-off

| Check | Status | Reviewer | Date |
|-------|--------|----------|------|
| Auth/Authz | | | |
| Data Protection | | | |
| Secrets | | | |
| Infrastructure | | | |
| Client Security | | | |
| Dependencies | | | |

**Overall Assessment**: PASS / FAIL / NEEDS WORK

**Notes**:
[Any concerns, exceptions, or follow-up items]

---

**Reviewed by**: [Name]
**Date**: [YYYY-MM-DD]
