# Project & Task Management System

Full-stack CRUD application built with **ASP.NET Core Web API (.NET 8)**, **Entity Framework Core**, **SQL Server**, and **Next.js (App Router) + TypeScript + Material UI**.

## Folder Structure

- `backend/ProjectTaskApi` – ASP.NET Core Web API
- `frontend/` – Next.js (App Router) frontend
- `database.sql` – SQL Server script for database and tables

---

## 1. Database Setup (SQL Server)

1. Open **SQL Server Management Studio** (or any SQL Server client).
2. Run the script in `database.sql`.

This will:

- Create the database `ProjectTaskDb` if it does not exist.
- Create `Projects` and `Tasks` tables.
- Add a few sample records.

If you prefer a different database name or server:

- Update the script accordingly.
- Make sure the connection string in the backend matches the database.

---

## 2. Backend (ASP.NET Core Web API)

### 2.1. Prerequisites

- .NET 8 SDK (or later that can target **net8.0**)
- SQL Server running and accessible

### 2.2. Configure Connection String

File: `backend/ProjectTaskApi/appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=ProjectTaskDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Update:

- `Server=localhost` – change to your SQL Server instance name if needed.
- `Trusted_Connection=True` – for Windows auth; use `User Id=...;Password=...;` for SQL auth.

### 2.3. Run the Backend

In a terminal at the repository root (`D:\Capstone`):

```bash
cd backend/ProjectTaskApi
dotnet run
```

By default, the API will listen on:

- `https://localhost:5001` (HTTPS)
- `http://localhost:5000` (HTTP)

Make sure the **frontend** uses the same base URL (see `NEXT_PUBLIC_API_BASE_URL`).

### 2.4. API Overview

**Base URL:** `http://localhost:5000/api`

#### Projects

- `GET    /api/projects` – list all projects
- `GET    /api/projects/{id}` – get single project (with tasks)
- `POST   /api/projects` – create project
- `PUT    /api/projects/{id}` – update project
- `DELETE /api/projects/{id}` – delete project (cascades to tasks)

#### Tasks

- `GET    /api/projects/{projectId}/tasks` – list tasks for a project
- `GET    /api/tasks/{id}` – get single task
- `POST   /api/projects/{projectId}/tasks` – create task under project
- `PUT    /api/tasks/{id}` – update task
- `DELETE /api/tasks/{id}` – delete task

---

## 3. Frontend (Next.js + TypeScript + MUI)

### 3.1. Prerequisites

- Node.js **v22.x**
- npm **>= 11.x**

### 3.2. Configure API Base URL

In `frontend/`, create a `.env.local` file:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

This must match the backend base address from `dotnet run`.

### 3.3. Install Dependencies

From the repo root:

```bash
cd frontend
npm install
```

### 3.4. Run the Frontend

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 3.5. Frontend Pages

- `/` – **Project list**
  - Shows all projects
  - Links to create project
  - Links to edit a project
  - Links to that project’s tasks
- `/projects/new` – **Create Project**
- `/projects/[id]/edit` – **Edit Project**
- `/projects/[projectId]/tasks` – **Task list for a project**
- `/projects/[projectId]/tasks/new` – **Create Task**
- `/projects/[projectId]/tasks/[taskId]/edit` – **Edit Task**

All data is loaded and saved using the **Fetch API** via a reusable helper:

- `frontend/lib/api.ts`

---

## 4. How Things Are Wired

- Backend uses **Entity Framework Core** (`AppDbContext`) with SQL Server.
- `ProjectsController` and `TasksController` implement the required REST endpoints.
- CORS is enabled in `Program.cs` to allow `http://localhost:3000`.
- Frontend uses **Material UI** for layout, forms, and tables.
- All forms are simple and focus on the required CRUD behavior rather than visual design.

---

## 5. Quick Start Summary

1. Run `database.sql` in SQL Server.
2. Update and verify `appsettings.json` connection string.
3. In `backend/ProjectTaskApi`: run `dotnet run`.
4. In `frontend`: create `.env.local`, run `npm install`, then `npm run dev`.
5. Open `http://localhost:3000` and test CRUD for Projects and Tasks.

