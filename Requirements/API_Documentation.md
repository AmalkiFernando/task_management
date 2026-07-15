# API Documentation

## Authentication API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user (default role: Team Member) | Public |
| POST | `/api/auth/login` | Authenticate a user and return a JWT token | Public |
| GET | `/api/auth/me` | Retrieve the authenticated user's profile | Authenticated |

---

## User Management API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/users` | Retrieve all users | Administrator, Project Manager |
| POST | `/api/users` | Create a new user | Administrator |
| PUT | `/api/users/:id` | Update user information | Administrator |
| DELETE | `/api/users/:id` | Delete a user | Administrator |

---

## Project Management API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/projects` | Retrieve projects based on the user's role | Authenticated |
| POST | `/api/projects` | Create a new project | Administrator, Project Manager |
| GET | `/api/projects/:id` | Retrieve project details | Project Members, Project Manager, Administrator |
| PUT | `/api/projects/:id` | Update project information | Administrator, Project Manager |
| DELETE | `/api/projects/:id` | Delete a project | Administrator, Project Manager |
| POST | `/api/projects/:id/members` | Add members to a project | Administrator, Project Manager |

---

## Task Management API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/projects/:projectId/tasks` | Retrieve all tasks within a project | Project Members, Project Manager, Administrator |
| POST | `/api/projects/:projectId/tasks` | Create a new task | Administrator, Project Manager |
| GET | `/api/tasks/my` | Retrieve tasks assigned to the authenticated user | Authenticated |
| PUT | `/api/tasks/:id` | Update task details or task status | Based on user role |
| DELETE | `/api/tasks/:id` | Delete a task | Administrator, Project Manager |

---

## Comment Management API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/tasks/:taskId/comments` | Retrieve comments for a task | Project Members, Project Manager, Administrator |
| POST | `/api/tasks/:taskId/comments` | Add a comment to a task | Project Members, Project Manager, Administrator |

---

## Dashboard API

| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/dashboard` | Retrieve dashboard statistics and summary information | Authenticated |


