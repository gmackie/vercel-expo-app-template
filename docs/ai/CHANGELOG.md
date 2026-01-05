# AI Skills Changelog

All notable changes to the skill system are documented here.

## [1.1.0] - 2025-01-05

### Added

#### Phase 3: QA Skills
- `gmacko-qa-verify` - Systematic QA verification with documented results

#### Phase 4: Release Skills
- `gmacko-release-prepare` - Generate changelog, release notes, verify environments
- `gmacko-release-deploy-web` - Vercel deployment with verification and rollback
- `gmacko-release-deploy-mobile` - EAS build and store submission workflow
- `gmacko-release-close` - Close issues, create GitHub release, archive docs

#### Configuration
- `opencode.json` - Skill permissions matrix and custom commands
- `.opencode/agent/scaffolder.md` - Project initialization agent
- `.opencode/agent/developer.md` - Feature development agent
- `.opencode/agent/triage.md` - Issue management agent
- `.opencode/agent/qa.md` - QA verification agent
- `.opencode/agent/release.md` - Release management agent

#### Commands
- `/init` - Start project initialization workflow
- `/interview` - Run project interview
- `/plan` - Generate implementation plan
- `/feature` - Plan a new feature
- `/issue` - Create a GitHub issue
- `/review` - Review a pull request
- `/qa` - Run QA verification
- `/release` - Prepare a release
- `/deploy-web` - Deploy to Vercel
- `/deploy-mobile` - Deploy via EAS
- `/close-release` - Finalize release

---

## [1.0.0] - 2025-01-05

### Added

#### Phase 1: Initialization Skills
- `gmacko-init-interview` - Guided Q&A for PROJECT_MANIFEST.json generation
- `gmacko-init-plan` - Generate INITIAL_PLAN.md from manifest
- `gmacko-init-bootstrap` - Execute setup.sh with validation
- `gmacko-init-orchestrator` - Full initialization workflow

#### Phase 2: Development Skills
- `gmacko-dev-feature-plan` - Feature planning and task breakdown
- `gmacko-dev-issue-create` - GitHub issue creation via gh CLI
- `gmacko-dev-pr-review` - PR review against standards

#### Documentation
- `docs/ai/SKILL_SYSTEM_DESIGN.md` - Architecture document
- `docs/ai/README.md` - Quick start guide
- `docs/ai/skills-catalog.md` - Skills reference
- `docs/ai/checklists/qa-checklist.md` - QA verification
- `docs/ai/checklists/release-checklist.md` - Release process
- `docs/ai/checklists/security-checklist.md` - Security review

#### Examples
- `docs/ai/examples/PROJECT_MANIFEST.example.json`
- `docs/ai/examples/INITIAL_PLAN.example.md`

#### GitHub Templates
- `.github/ISSUE_TEMPLATE/bug.yml` - Bug report template
- `.github/ISSUE_TEMPLATE/feature.yml` - Feature request template
- `.github/pull_request_template.md` - PR template

### Technical Notes
- Skills use YAML frontmatter with `name`, `description`, and `metadata`
- Descriptions follow "Use when (1)..., (2)..., (3)..." pattern for intent matching
- Workflows defined using Graphviz `dot` notation
- Red flags table prevents common AI mistakes
- Handoff documents ensure audit trail

---

## Version Format

Skills version alongside the template. Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes to skill interfaces or artifact schemas
- **MINOR**: New skills or features
- **PATCH**: Bug fixes and improvements

## Compatibility

| Skills Version | Template Version | Notes |
|----------------|------------------|-------|
| 1.1.0 | 1.0.0 | Added QA, Release skills, and agent configs |
| 1.0.0 | 1.0.0 | Initial release |
