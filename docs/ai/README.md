# AI Agent Documentation

This directory contains documentation, artifacts, and workflows for AI agents working on Gmacko Ventures projects.

## Directory Structure

```
docs/ai/
├── README.md              # This file
├── SKILL_SYSTEM_DESIGN.md # Architecture document
├── CHANGELOG.md           # Skill version history
├── skills-catalog.md      # List of available skills
├── handoffs/              # Stage gate documents
│   └── {id}-{stage}.md    # Per-feature handoffs
├── checklists/            # Standard checklists
│   ├── qa-checklist.md
│   ├── release-checklist.md
│   └── security-checklist.md
├── examples/              # Reference examples
│   ├── PROJECT_MANIFEST.example.json
│   └── INITIAL_PLAN.example.md
└── releases/              # Release records
    └── {date}-{version}.md
```

## Quick Start

### For New Projects

1. **Run the init orchestrator**:
   - Invoke the `gmacko-init-orchestrator` skill
   - Or run skills individually: interview -> plan -> bootstrap

2. **Review artifacts**:
   - `PROJECT_MANIFEST.json` - Source of truth for project config
   - `INITIAL_PLAN.md` - Implementation roadmap

3. **Start development**:
   - Follow milestones in INITIAL_PLAN.md
   - Use `gmacko-dev-feature-plan` for task breakdown

### For Feature Development

1. **Plan the feature**:
   - Use `gmacko-dev-feature-plan` skill
   - Creates `docs/ai/handoffs/{feature}-plan.md`

2. **Create issues**:
   - Use `gmacko-dev-issue-create` skill
   - Links issues to plan

3. **Implement**:
   - Follow the task breakdown
   - Mark tasks complete as you go

4. **Review**:
   - Use `gmacko-dev-pr-review` skill
   - Verify against acceptance criteria

5. **Handoff**:
   - Create dev handoff document
   - Ready for QA verification

## Available Skills

| Skill | Purpose | Permission |
|-------|---------|------------|
| `gmacko-init-interview` | Gather project requirements | allow |
| `gmacko-init-plan` | Generate INITIAL_PLAN.md | allow |
| `gmacko-init-bootstrap` | Execute setup.sh | ask |
| `gmacko-init-orchestrator` | Full init workflow | ask |
| `gmacko-dev-feature-plan` | Plan feature implementation | allow |
| `gmacko-dev-issue-create` | Create GitHub issues | ask |
| `gmacko-dev-pr-review` | Review pull requests | allow |

Skills are located in `.opencode/skill/`.

## Artifact Flow

```
Interview
    ↓
PROJECT_MANIFEST.json (source of truth)
    ↓
INITIAL_PLAN.md (human-readable plan)
    ↓
docs/ai/handoffs/{feature}-plan.md (per-feature)
    ↓
GitHub Issues
    ↓
Implementation
    ↓
docs/ai/handoffs/{feature}-dev.md
    ↓
PR Review
    ↓
docs/ai/handoffs/{feature}-qa.md
    ↓
Release
    ↓
docs/ai/releases/{version}.md
```

## Conventions

### Handoff Document Naming
- `{feature-id}-plan.md` - Feature planning document
- `{feature-id}-dev.md` - Development handoff
- `{feature-id}-qa.md` - QA verification
- `init-*.md` - Initialization phase documents

### Issue Prefixes
- `[Bug]:` - Bug reports
- `[Feature]:` - Feature requests
- `[Task]:` - Implementation tasks
- `[Docs]:` - Documentation updates

### Labels
See `.github/ISSUE_TEMPLATE/` for the full label taxonomy.

## Best Practices

1. **Always check existing artifacts** before creating new ones
2. **Update PROJECT_MANIFEST.json** when requirements change
3. **Create handoff documents** at each stage gate
4. **Link issues to plans** for traceability
5. **Run validation** (`pnpm typecheck && pnpm lint && pnpm build`) before handoffs

## Troubleshooting

### Skill not found
Ensure skills are in `.opencode/skill/{name}/SKILL.md`

**Important**: Skills are discovered at OpenCode session start. If you add new skills:
1. Exit the current OpenCode session
2. Start a new session from the project root
3. Run `find_skills` to verify discovery

If skills still don't appear:
- Verify frontmatter has `name:` and `description:` fields
- Ensure `name` matches the directory name exactly
- Check that `name` follows lowercase-with-hyphens convention

### Manifest validation fails
Check `PROJECT_MANIFEST.json` against the schema in examples

### gh CLI errors
Run `gh auth status` to verify authentication

## Contributing

When adding new skills:
1. Create directory in `.opencode/skill/{name}/`
2. Add `SKILL.md` with proper frontmatter
3. Update `skills-catalog.md`
4. Add entry to `CHANGELOG.md`
