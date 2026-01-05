# AI Skills Changelog

All notable changes to the skill system are documented here.

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
| 1.0.0 | 1.0.0 | Initial release |
