# Gmacko Ventures Skill System Design

> Architecture document for AI agent skills used across Gmacko Ventures projects.

## Overview

This document defines the skill system architecture for the vercel-neon-expo-template, which serves as the foundation for all Gmacko Ventures applications. The system enables AI agents to:

1. **Initialize new projects** through guided interviews
2. **Manage feature development** via issue tracking and backlog management
3. **Ensure quality** through QA verification workflows
4. **Automate releases** with proper staging/production gates

## Core Principles

### Artifacts Are The API

Skills communicate via durable repo artifacts, not chat state:

| Artifact | Purpose | Location |
|----------|---------|----------|
| `PROJECT_MANIFEST.json` | Machine-readable project configuration | Root |
| `INITIAL_PLAN.md` | Human-readable project plan and scope | Root |
| `docs/ai/handoffs/*.md` | Stage gate documents between roles | Per-feature |
| `docs/ai/releases/*.md` | Release records and changelogs | Per-release |

### Three-Tier Skill Hierarchy

```
Tier A: Orchestrators (composite)
    └── Coordinate multiple skills, minimal logic
    └── Example: gmacko-init-orchestrator

Tier B: Workhorse Skills
    └── Create/update artifacts, run commands, make PRs
    └── Example: gmacko-init-interview, gmacko-dev-pr-review

Tier C: Utilities
    └── Small, reusable building blocks
    └── Example: env-audit, capability-check
```

### Permission Model

| Permission | Use Case | Examples |
|------------|----------|----------|
| `allow` | Safe, local, read-only | Interview, planning, lint/typecheck |
| `ask` | External side effects | Provisioning, issue creation, deployments |
| `deny` | High-risk operations | Force push, delete repos, rotate keys |

## Skill Catalog

### Phase 1: Project Initialization

| Skill | Description | Priority |
|-------|-------------|----------|
| `gmacko-init-interview` | Guided Q&A to populate PROJECT_MANIFEST.json | High |
| `gmacko-init-plan` | Generate INITIAL_PLAN.md from manifest | High |
| `gmacko-init-bootstrap` | Execute setup.sh with validation | High |
| `gmacko-init-provision` | Wrap provision.sh with guardrails | Medium |
| `gmacko-init-validate` | Run typecheck/lint/build verification | Medium |
| `gmacko-init-orchestrator` | One-button init: interview -> plan -> bootstrap | Medium |

### Phase 2: Feature Development

| Skill | Description | Priority |
|-------|-------------|----------|
| `gmacko-dev-feature-plan` | Break features into tasks with acceptance criteria | High |
| `gmacko-dev-issue-create` | Create GitHub issues via `gh` with templates | High |
| `gmacko-dev-issue-triage` | Label/priority normalization, deduplication | Medium |
| `gmacko-dev-implement` | Execute scoped task list from plan | Medium |
| `gmacko-dev-pr-review` | Review PRs against plan and standards | Medium |
| `gmacko-dev-qa-verify` | Verify completion with test checklist | Medium |

### Phase 3: Release Management

| Skill | Description | Priority |
|-------|-------------|----------|
| `gmacko-release-prepare` | Draft release notes, verify env readiness | Medium |
| `gmacko-release-deploy-web` | Vercel deployment with smoke tests | Low |
| `gmacko-release-deploy-mobile` | EAS build/submit with validation | Low |
| `gmacko-release-close` | Close issues, annotate PRs, write record | Low |

## Workflow Patterns

### Interview Pattern (Progressive Disclosure)

```dot
digraph interview {
    rankdir=TB;
    node [shape=box];
    
    start [label="Start Interview" shape=ellipse];
    frame [label="Frame: Explain process\n(12 questions, can skip)"];
    product [label="Product Questions\n(goal, users, MVP scope)"];
    platforms [label="Platform Questions\n(web-only vs mobile)"];
    integrations [label="Integration Questions\n(Clerk, Stripe, etc.)"];
    data [label="Data Questions\n(entities, relationships)"];
    api [label="API Questions\n(tRPC vs REST vs WS)"];
    deploy [label="Deployment Questions\n(Vercel vs k8s, envs)"];
    summarize [label="Show Summary Table"];
    confirm [label="User Confirms?" shape=diamond];
    write [label="Write PROJECT_MANIFEST.json\n& INITIAL_PLAN.md"];
    done [label="Interview Complete" shape=ellipse];
    
    start -> frame -> product -> platforms -> integrations;
    integrations -> data -> api -> deploy -> summarize;
    summarize -> confirm;
    confirm -> write [label="yes"];
    confirm -> product [label="revise"];
    write -> done;
}
```

### Handoff Pattern (Dev -> QA -> Release)

```dot
digraph handoff {
    rankdir=LR;
    node [shape=box];
    
    plan [label="Feature Plan\nhandoffs/<id>-plan.md"];
    dev [label="Development\nhandoffs/<id>-dev.md"];
    qa [label="QA Verification\nhandoffs/<id>-qa.md"];
    release [label="Release Record\nreleases/<version>.md"];
    
    plan -> dev [label="implement"];
    dev -> qa [label="verify"];
    qa -> release [label="deploy"];
    
    subgraph cluster_gates {
        label="Stage Gates";
        style=dashed;
        gate1 [label="AC met?" shape=diamond];
        gate2 [label="Tests pass?" shape=diamond];
        gate3 [label="Go/No-go?" shape=diamond];
    }
}
```

## Artifact Schemas

### PROJECT_MANIFEST.json

```json
{
  "$schema": "./schemas/project-manifest.schema.json",
  "version": "1.0.0",
  "project": {
    "name": "my-saas-app",
    "displayName": "My SaaS App",
    "description": "A description of the project",
    "org": "gmacko"
  },
  "platforms": {
    "web": true,
    "mobile": true,
    "mobileOnly": false
  },
  "integrations": {
    "auth": { "provider": "clerk", "enabled": true },
    "payments": { "provider": "stripe", "enabled": true },
    "analytics": { "provider": "posthog", "enabled": true },
    "monitoring": { "provider": "sentry", "enabled": true },
    "email": { "provider": "sendgrid", "enabled": false },
    "realtime": { "provider": "pusher", "enabled": false },
    "storage": { "provider": "uploadthing", "enabled": false }
  },
  "database": {
    "provider": "neon",
    "orm": "drizzle",
    "entities": ["users", "teams", "projects"]
  },
  "api": {
    "style": "trpc",
    "realtime": false
  },
  "deployment": {
    "web": {
      "provider": "vercel",
      "environments": ["development", "staging", "production"]
    },
    "mobile": {
      "provider": "eas",
      "profiles": ["development", "preview", "production"]
    }
  },
  "domains": {
    "production": "app.example.com",
    "staging": "staging.example.com"
  }
}
```

### Handoff Document Structure

```markdown
# [Feature/Issue] Handoff: [Stage]

## Context
- Issue: #123
- Plan: docs/ai/handoffs/123-plan.md
- Author: @agent-name
- Date: 2025-01-05

## Scope
[What was included/excluded]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Test Plan
[How to verify]

## Migration Notes
[Database/breaking changes]

## Known Issues
[Any caveats]

## Recommendation
[Go/No-go with reasoning]
```

## Red Flags (Common AI Failure Modes)

| Rationalization | Correction |
|-----------------|------------|
| "I'll skip typecheck, it's a small change" | ALL changes require `pnpm typecheck && pnpm lint` |
| "Let me just commit the .env file" | NEVER commit secrets; use `.env.local` only |
| "I'll skip the interview, user seems clear" | ALWAYS complete the manifest before generating plan |
| "Tests can be added later" | Include test plan in every handoff document |
| "I'll push directly to main" | ALL changes go through PR with review |

## Integration with Existing Scripts

Skills WRAP existing scripts rather than replace them:

```
┌─────────────────────────────────────────────────────────┐
│ gmacko-init-bootstrap                                   │
├─────────────────────────────────────────────────────────┤
│ 1. Preflight checks (git clean, tools installed)        │
│ 2. Read PROJECT_MANIFEST.json for app name              │
│ 3. Execute: ./scripts/setup.sh <app-name> [--no-mobile] │
│ 4. Post-validate: pnpm typecheck && pnpm lint           │
│ 5. Write: docs/ai/handoffs/init-bootstrap.md            │
└─────────────────────────────────────────────────────────┘
```

## Versioning Strategy

- Skills version alongside the template
- `TEMPLATE_VERSION` in `package.json`
- `docs/ai/CHANGELOG.md` tracks skill changes
- Compatibility field in skill metadata validates version match

## Directory Structure

```
.opencode/
└── skill/
    ├── gmacko-init-interview/
    │   └── SKILL.md
    ├── gmacko-init-plan/
    │   └── SKILL.md
    ├── gmacko-init-bootstrap/
    │   └── SKILL.md
    ├── gmacko-init-orchestrator/
    │   └── SKILL.md
    ├── gmacko-dev-feature-plan/
    │   └── SKILL.md
    ├── gmacko-dev-issue-create/
    │   └── SKILL.md
    └── gmacko-dev-pr-review/
        └── SKILL.md

docs/ai/
├── README.md
├── CHANGELOG.md
├── skills-catalog.md
├── handoffs/
│   └── .gitkeep
├── checklists/
│   ├── qa-checklist.md
│   ├── release-checklist.md
│   └── security-checklist.md
├── examples/
│   ├── INITIAL_PLAN.example.md
│   └── PROJECT_MANIFEST.example.json
└── releases/
    └── .gitkeep
```

## Next Steps

1. Implement Phase 1 skills (init-interview, init-plan, init-bootstrap)
2. Create PROJECT_MANIFEST.json schema
3. Create INITIAL_PLAN.md template
4. Add GitHub issue templates
5. Test end-to-end flow with sample project
