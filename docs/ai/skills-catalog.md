# Skills Catalog

Available AI agent skills for Gmacko Ventures projects.

## Phase 1: Project Initialization

### gmacko-init-interview
**Purpose**: Conduct a guided interview to gather project requirements and generate PROJECT_MANIFEST.json.

**Use when**:
- Starting a new project from the template
- User wants to create a fresh app without git history
- Gathering requirements for project configuration

**Permission**: `allow`

**Produces**: `PROJECT_MANIFEST.json`

---

### gmacko-init-plan
**Purpose**: Generate INITIAL_PLAN.md from an existing PROJECT_MANIFEST.json.

**Use when**:
- PROJECT_MANIFEST.json exists
- User wants a detailed implementation roadmap
- Translating manifest into actionable milestones

**Permission**: `allow`

**Requires**: `PROJECT_MANIFEST.json`
**Produces**: `INITIAL_PLAN.md`, `docs/ai/handoffs/init-plan.md`

---

### gmacko-init-bootstrap
**Purpose**: Execute setup.sh to initialize the project from the template.

**Use when**:
- PROJECT_MANIFEST.json and INITIAL_PLAN.md exist
- Ready to rename template to project name
- Setting up fresh repository

**Permission**: `ask` (destructive operation)

**Requires**: `PROJECT_MANIFEST.json`, `scripts/setup.sh`
**Produces**: Renamed project, `docs/ai/handoffs/init-bootstrap.md`

---

### gmacko-init-orchestrator
**Purpose**: One-button initialization workflow: interview -> plan -> bootstrap -> provision.

**Use when**:
- User wants complete project setup from scratch
- Orchestrating the full init workflow

**Permission**: `ask` (contains destructive operations)

**Produces**: All initialization artifacts

---

## Phase 2: Feature Development

### gmacko-dev-feature-plan
**Purpose**: Break down feature requests into detailed implementation plans with tasks and acceptance criteria.

**Use when**:
- Breaking down a feature request into implementable tasks
- Creating a detailed feature specification
- Preparing work for development

**Permission**: `allow`

**Produces**: `docs/ai/handoffs/{feature-id}-plan.md`

---

### gmacko-dev-issue-create
**Purpose**: Create well-structured GitHub issues using the gh CLI with proper templates, labels, and linking.

**Use when**:
- Creating GitHub issues from feature plans or bug reports
- Documenting bugs found during development
- Managing the project backlog

**Permission**: `ask` (external side effect)

**Requires**: `gh` CLI authenticated
**Produces**: GitHub issue URL

---

### gmacko-dev-pr-review
**Purpose**: Review pull requests against coding standards, INITIAL_PLAN.md, and feature acceptance criteria.

**Use when**:
- Reviewing a pull request
- Verifying PR meets acceptance criteria
- Checking for common issues before merge

**Permission**: `allow`

**Produces**: Review summary with recommendation

---

## Phase 3: Quality Assurance (Planned)

### gmacko-qa-verify
**Status**: Planned

**Purpose**: Verify feature completion against acceptance criteria and test plans.

---

### gmacko-qa-regression
**Status**: Planned

**Purpose**: Run regression testing checklist for releases.

---

## Phase 4: Release Management (Planned)

### gmacko-release-prepare
**Status**: Planned

**Purpose**: Prepare release notes, verify environment readiness.

---

### gmacko-release-deploy-web
**Status**: Planned

**Purpose**: Manage Vercel deployment workflow.

---

### gmacko-release-deploy-mobile
**Status**: Planned

**Purpose**: Manage EAS build and submission workflow.

---

### gmacko-release-close
**Status**: Planned

**Purpose**: Close issues, annotate PRs, write release record.

---

## Permission Reference

| Permission | Meaning | When Used |
|------------|---------|-----------|
| `allow` | Runs without confirmation | Safe, local operations |
| `ask` | Requires user confirmation | External side effects |
| `deny` | Blocked by default | Dangerous operations |

## Skill Locations

Skills are stored in `.opencode/skill/{name}/SKILL.md`.

```
.opencode/skill/
├── gmacko-init-interview/SKILL.md
├── gmacko-init-plan/SKILL.md
├── gmacko-init-bootstrap/SKILL.md
├── gmacko-init-orchestrator/SKILL.md
├── gmacko-dev-feature-plan/SKILL.md
├── gmacko-dev-issue-create/SKILL.md
└── gmacko-dev-pr-review/SKILL.md
```

## Adding New Skills

1. Create directory: `.opencode/skill/{name}/`
2. Create `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: {name}
   description: Use when (1) ..., (2) ..., (3) ...
   license: MIT
   compatibility: opencode
   metadata:
     phase: initialization|development|qa|release
     tier: orchestrator|workhorse|utility
     permission: allow|ask|deny
   ---
   ```
3. Add skill content following existing patterns
4. Update this catalog
5. Add entry to `docs/ai/CHANGELOG.md`
