# Taskframe — Project & Team Task Management Platform

A full-stack web app for managing projects, teams, and tasks with three roles:
**Administrator**, **Project Manager**, and **Team Member**.

- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Backend:** Node.js, Express, Sequelize
- **Database:** MySQL
- **Auth:** JWT + role-based access control (RBAC)
- **CI:** GitHub Actions (lint, test, build)

---

## 1. Features

### Core (as required)
- **Administrator** — manage users (create/edit/suspend/delete, change roles), view all projects, system-wide activity log.
- **Project Manager** — create/edit/delete projects, add/remove team members, create/edit/delete tasks, assign tasks.
- **Team Member** — view assigned projects, view assigned tasks, update task progress/status, comment on tasks.
- Secure JWT authentication and RBAC enforced on every API route (not just hidden in the UI).
- RESTful API with proper resource relationships (Users ↔ Projects ↔ Tasks ↔ Comments).
- Server-side validation (`express-validator`) and Sequelize model-level validation.
- Responsive UI (mobile → desktop) built with Tailwind.

### Extra features (for stronger shortlisting consideration)
- **Kanban-style task board** (drag-free status dropdowns per column: To do / In progress / In review / Done).
- **Task comments** for async collaboration on a task.
- **Activity audit log** (who did what, when) surfaced on the admin dashboard.
- **Role-aware dashboards** with live stats (task counts by status, overdue tasks, etc.).
- **Self-registration** (defaults to Team Member; admins promote users).
- **Pagination + search/filter** on Users and Projects list endpoints.
- **Rate limiting & security headers** (`express-rate-limit`, `helmet`) on the API.
- **Seed script** with demo admin/manager/member accounts and a sample project.
- **CI pipeline** that lints, tests, and builds both apps on every push/PR.

---

## 2. Architecture

```
project/
├── backend/                 Express API (MySQL via Sequelize)
│   ├── src/
│   │   ├── config/db.js     Sequelize connection
│   │   ├── models/          User, Project, ProjectMember, Task, Comment, ActivityLog
│   │   ├── middleware/      auth (JWT), rbac (authorize), projectAccess, validate, errorHandler
│   │   ├── controllers/     auth, user, project, task, comment, dashboard
│   │   ├── routes/          REST endpoints, mounted under /api
│   │   ├── validators/      express-validator rule sets
│   │   └── seeders/seed.js  Demo data
│   ├── tests/               Jest + Supertest
│   └── server.js
├── frontend/                 Next.js App Router
│   ├── app/
│   │   ├── login, register
│   │   └── dashboard/       layout + overview, projects, projects/[id], tasks, tasks/[id], users
│   ├── components/          Sidebar, ProtectedRoute, StatusBadge
│   └── lib/                 api.js (axios + interceptors), AuthContext.js
└── .github/workflows/ci.yml
```

### Data model

- `User` — id, name, email, password (hashed), role (`admin` / `project_manager` / `team_member`), status.
- `Project` — id, name, description, status, start/end date, created_by (FK → User).
- `ProjectMember` — join table (project_id, user_id, project_role) → many-to-many Users ↔ Projects.
- `Task` — id, project_id (FK), title, description, status, priority, due_date, assigned_to (FK → User), created_by (FK → User).
- `Comment` — id, task_id (FK), user_id (FK), body.
- `ActivityLog` — id, user_id, action, entity_type, entity_id, metadata (JSON) — audit trail.

### Role-based access control

Enforced **server-side** on every route via `protect` (JWT check) and `authorize(...roles)` middleware, plus a `loadProjectAndCheckAccess` middleware that checks project membership for non-admins. Examples:
- Only `admin` can create/delete users or change roles.
- Only `admin` or the project's manager can create/delete tasks, edit project details, or manage membership.
- `team_member` can only view/update tasks assigned to them, and only their `status` field.

---

## 3. Getting started

### Prerequisites
- Node.js 18+
- MySQL 8+ (or a compatible server)

### Backend

```bash
cd backend
cp .env.example .env       # edit DB_* and JWT_SECRET
# create the database (once):
mysql -u root -p -e "CREATE DATABASE task_platform;"

npm install
npm run seed                # creates demo admin/manager/member + sample project
npm run dev                 # http://localhost:5000
```

Demo accounts created by the seed script:

| Role            | Email                | Password     |
|-----------------|-----------------------|---------------|
| Admin           | admin@example.com     | Admin@123     |
| Project Manager | manager@example.com   | Manager@123   |
| Team Member     | member@example.com    | Member@123    |

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                         # http://localhost:3000
```

### Tests & linting

```bash
cd backend && npm run lint && npm test
cd frontend && npm run lint && npm run build
```

---

## 4. Key API endpoints

| Method | Endpoint                              | Access                        |
|--------|-----------------------------------------|--------------------------------|
| POST   | `/api/auth/register`                    | Public (creates team_member)  |
| POST   | `/api/auth/login`                       | Public                        |
| GET    | `/api/auth/me`                          | Authenticated                 |
| GET    | `/api/users`                            | Admin, PM (for member picking)|
| POST   | `/api/users`                            | Admin                         |
| PUT    | `/api/users/:id`                        | Admin                         |
| GET    | `/api/projects`                         | Authenticated (scoped by role)|
| POST   | `/api/projects`                         | Admin, PM                     |
| GET    | `/api/projects/:id`                     | Members, PM, Admin             |
| PUT    | `/api/projects/:id`                     | Admin, owning PM              |
| POST   | `/api/projects/:id/members`             | Admin, PM                     |
| GET    | `/api/projects/:projectId/tasks`        | Members, PM, Admin             |
| POST   | `/api/projects/:projectId/tasks`        | Admin, PM                     |
| GET    | `/api/tasks/my`                         | Authenticated                 |
| PUT    | `/api/tasks/:id`                        | Assignee (status only), PM/Admin (full) |
| GET/POST | `/api/tasks/:taskId/comments`         | Assignee, PM, Admin            |
| GET    | `/api/dashboard`                        | Role-aware stats               |

---

## 5. CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`/`develop`:
- **backend job:** `npm install` → `eslint` → `jest` (validation tests, no live DB required)
- **frontend job:** `npm install` → `next lint` → `next build`

This can be extended with a deploy step (e.g. to Railway/Render for the API, Vercel for the frontend) once hosting is decided.

---

## 6. Notes / possible next steps

- Add refresh tokens / token blacklist for logout-everywhere.
- File attachments on tasks (e.g. S3-backed uploads).
- Email notifications (task assigned, due soon) via a queue.
- Sequelize migrations instead of `sequelize.sync()` for production schema changes.
