# Taskframe – Project & Team Task Management Platform

Taskframe is a full-stack web application developed for the **Intern Full Stack Developer Practical Assignment**. The platform enables administrators, project managers, and team members to manage projects and tasks securely using **Role-Based Access Control (RBAC)** and **JWT Authentication**.

---

# Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v18 or later)
- npm
- MySQL
- Git

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/AmalkiFernando/task_management.git
cd task_management
```

---

## 2. Backend Setup

1. Navigate to the backend folder - **cd backend**
2. Install dependencies - **npm install**
3. Create the environment file - **cp .env.example .env**
4. Update the `.env` file with your database configuration.
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_platform
DB_USER=your_database_username
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PORT=5000
```
5. Create the MySQL database.
```sql
CREATE DATABASE task_platform;
```
6. Run the database seed script - **npm run seed**
7. Start the backend server - **npm run dev**

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@example.com | Admin@123 |
| Project Manager | manager@example.com | Manager@123 |
| Team Member | member@example.com | Member@123 |

---

## 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder - **cd frontend**
2. Install dependencies - **npm install**
3. Create the frontend environment file - **cp .env.example .env.local**
```
Update the API URL.
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
4. Start the frontend - **npm run dev**


# Project Structure

```
task_management/
│
├── backend/
│
├── frontend/
│
├── docs/
│   ├── ERD.png
│   ├── UseCaseDiagram.png
│   ├── SystemArchitecture.png
│   └── FeatureCompletionReport.pdf
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
```

---

# Author

**Amalki Fernando**

BSc (Hons) in Information Technology (Artificial Intelligence)  
Sri Lanka Institute of Information Technology (SLIIT)