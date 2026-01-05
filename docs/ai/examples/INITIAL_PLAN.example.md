# Initial Plan: Acme SaaS Platform

> Generated from PROJECT_MANIFEST.json on 2025-01-05
> Template Version: 1.0.0

## Executive Summary

**Acme SaaS Platform** is a B2B SaaS platform for project management and team collaboration, targeting small to medium teams (5-50 users).

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platforms | Web-only (MVP) | Mobile deferred to Phase 2 |
| Auth | Clerk with orgs | Team-based access control needed |
| Payments | Stripe subscriptions | 3-tier pricing with trial |
| API Style | tRPC + Pusher | Type-safe with real-time updates |
| Database | Neon + Drizzle | Serverless PostgreSQL |
| Deployment | Vercel | Fast iteration, preview deploys |

## MVP Scope

### In Scope
- User authentication and team management
- Project CRUD with task lists
- Real-time task status updates
- Basic analytics dashboard

### Out of Scope (Phase 2+)
- Mobile app
- Advanced reporting
- Third-party integrations
- Custom workflows

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User activation rate | > 60% | Users who create first project within 7 days |
| Weekly active retention | > 40% | Users returning week-over-week |
| Task completion rate | > 80% | Tasks marked complete vs created |

## Data Model

### Entity Relationship Diagram

```
┌─────────┐       ┌─────────────┐       ┌─────────┐
│  users  │───1:N─│ teamMembers │───N:1─│  teams  │
└─────────┘       └─────────────┘       └─────────┘
     │                                       │
     │                                      1:N
     │                                       │
     │            ┌──────────┐          ┌─────────┐
     └────1:N─────│  tasks   │───N:1────│projects │
    (assignee)    └──────────┘          └─────────┘
```

### Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| clerkId | text | Clerk user ID (unique) |
| email | text | User email |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

#### teams
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Team display name |
| slug | text | URL-safe identifier |
| ownerId | uuid | FK to users |
| createdAt | timestamp | Record creation |

#### teamMembers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| teamId | uuid | FK to teams |
| userId | uuid | FK to users |
| role | enum | owner, admin, member |
| joinedAt | timestamp | Membership start |

#### projects
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| teamId | uuid | FK to teams |
| name | text | Project name |
| description | text | Project description |
| status | enum | active, archived |
| createdAt | timestamp | Record creation |

#### tasks
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| projectId | uuid | FK to projects |
| title | text | Task title |
| description | text | Task details |
| status | enum | todo, in_progress, done |
| assigneeId | uuid | FK to users (nullable) |
| dueDate | timestamp | Due date (nullable) |
| createdAt | timestamp | Record creation |

## API Routers

### users
- `users.me` - Get current user profile
- `users.update` - Update profile

### teams
- `teams.list` - List user's teams
- `teams.create` - Create new team
- `teams.get` - Get team by ID
- `teams.update` - Update team
- `teams.delete` - Delete team
- `teams.members.list` - List team members
- `teams.members.invite` - Invite member
- `teams.members.remove` - Remove member

### projects
- `projects.list` - List team projects
- `projects.create` - Create project
- `projects.get` - Get project with tasks
- `projects.update` - Update project
- `projects.archive` - Archive project

### tasks
- `tasks.list` - List project tasks
- `tasks.create` - Create task
- `tasks.update` - Update task (triggers realtime)
- `tasks.delete` - Delete task
- `tasks.assign` - Assign to user
- `tasks.move` - Change status (Kanban)

### billing
- `billing.getSubscription` - Current plan
- `billing.createCheckout` - Stripe checkout
- `billing.createPortal` - Customer portal

## Screen Specifications

### 1. Landing Page (/)

**Purpose**: Marketing page with value prop and pricing

**Components**:
- Hero section with CTA
- Feature highlights
- Pricing table (3 tiers)
- Footer with links

**Auth State**: Public

---

### 2. Sign In (/sign-in)

**Purpose**: Clerk-powered authentication

**Components**:
- Clerk `<SignIn />` component
- Social providers: Google, GitHub
- Redirect to /dashboard on success

**Auth State**: Public (redirects if authenticated)

---

### 3. Dashboard (/dashboard)

**Purpose**: Team overview and quick actions

**Components**:
- Team selector (header)
- Recent projects list
- Assigned tasks widget
- Activity feed
- Quick create buttons

**Auth State**: Protected

**Data Requirements**:
- `teams.list`
- `projects.list` (limit: 5)
- `tasks.list` (assigned to me, limit: 10)

---

### 4. Projects List (/projects)

**Purpose**: All projects for current team

**Components**:
- Project cards grid
- Create project button
- Filter: active/archived
- Search

**Auth State**: Protected

**Data Requirements**:
- `projects.list`

---

### 5. Project Detail (/projects/[id])

**Purpose**: Project view with task board

**Components**:
- Project header (name, description, actions)
- Kanban board (todo, in_progress, done)
- Task cards (draggable)
- Create task modal
- Real-time updates via Pusher

**Auth State**: Protected

**Data Requirements**:
- `projects.get`
- `tasks.list`
- Pusher subscription: `private-project-{id}`

---

### 6. Settings (/settings)

**Purpose**: User and team settings

**Components**:
- Profile section
- Team settings (if admin/owner)
- Notification preferences
- Danger zone (leave team)

**Auth State**: Protected

---

### 7. Billing (/settings/billing)

**Purpose**: Subscription management

**Components**:
- Current plan display
- Usage stats
- Upgrade/downgrade buttons
- Stripe Customer Portal link

**Auth State**: Protected (team owner only)

**Data Requirements**:
- `billing.getSubscription`

## Integration Configuration

### Clerk
- Organizations enabled for team management
- Social providers: Google, GitHub
- MFA: Disabled (MVP)
- Webhook: User sync to database

### Stripe
- Subscription model with 3 plans:
  - Free: 1 project, 3 members
  - Pro ($15/mo): 10 projects, 10 members
  - Enterprise ($49/mo): Unlimited
- 14-day trial on Pro/Enterprise
- Webhook: Subscription sync

### PostHog
- Autocapture enabled
- Session recording enabled
- Key events to track:
  - `project_created`
  - `task_created`
  - `task_completed`
  - `team_member_invited`

### Sentry
- Performance monitoring enabled
- Sample rate: 10%
- Source maps uploaded on deploy

### Pusher
- Private channels for projects
- Events: `task-updated`, `task-created`, `task-deleted`

## Deployment Environments

| Environment | Branch | Domain | Purpose |
|-------------|--------|--------|---------|
| Development | dev | (preview URLs) | Feature development |
| Staging | staging | staging.acme-saas.com | QA and demos |
| Production | main | app.acme-saas.com | Live users |

## Implementation Milestones

### Milestone 1: Foundation (Week 1)
- [ ] Run setup.sh and provision.sh
- [ ] Implement database schema
- [ ] Set up Clerk with organizations
- [ ] Basic tRPC routers (users, teams)
- [ ] Authentication flow

### Milestone 2: Core Features (Week 2)
- [ ] Projects CRUD
- [ ] Tasks CRUD with Kanban
- [ ] Pusher real-time integration
- [ ] Dashboard screen

### Milestone 3: Polish (Week 3)
- [ ] Stripe subscription integration
- [ ] Settings screens
- [ ] PostHog analytics events
- [ ] Error boundaries with Sentry

### Milestone 4: Launch (Week 4)
- [ ] Landing page
- [ ] Staging deployment
- [ ] QA testing
- [ ] Production deployment
- [ ] Monitoring setup

## Handoff Checklist

Before starting implementation:
- [ ] PROJECT_MANIFEST.json committed
- [ ] INITIAL_PLAN.md reviewed and approved
- [ ] Environment variables documented
- [ ] Team access granted (Vercel, Neon, Clerk, etc.)
- [ ] Repository created in gmacko org

---

*This plan was generated by the gmacko-init-plan skill. Updates should be reflected in PROJECT_MANIFEST.json first, then regenerate this document.*
