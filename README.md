# TrainLog

A full-stack race and workout tracking application built to manage training plans, log workouts, track shoe mileage, and count down to upcoming races. Built as a personal project to support half marathon training, and as a demonstration of full-stack development practices.

## Overview

TrainLog lets a runner:

- Create training plans with a start/end date
- Log workouts (runs, cross-training, rest days) with planned vs. actual distance, pace, and duration
- Track races tied to a training plan, with a live countdown
- Track running shoes and their accumulated mileage (calculated automatically from logged workouts)
- View a dashboard summarizing active plan progress, upcoming races, and weekly mileage trends
- Manage users and roles through an admin panel (role-based access control)

## Tech Stack

**Backend**
- ASP.NET Core Web API (.NET 8+)
- Entity Framework Core — Code First, migrations
- SQL Server
- ASP.NET Core Identity — authentication, roles
- JWT Bearer authentication
- Swagger / Swashbuckle for API documentation and testing

**Frontend**
- React + TypeScript
- Vite
- Material UI (MUI)
- React Router
- Axios (with JWT interceptor)
- Recharts (dashboard visualizations)

**Architecture**
- Fully separated frontend/backend — communicate exclusively over a REST API, no shared server rendering
- Layered backend: `Domain` (entities), `Infrastructure` (DbContext, migrations), `Api` (controllers, DTOs)
- Role-based authorization (`User` / `Admin`) enforced server-side via JWT claims

## Project Structure

```
trainlog-api/
├── TrainLog.Api/              # Controllers, Program.cs, DTOs, appsettings
├── TrainLog.Domain/           # Entity classes
├── TrainLog.Infrastructure/   # DbContext, migrations
└── TrainLog.Api.Tests/

trainlog-client/
├── src/
│   ├── api/                   # Typed API call modules (one per entity)
│   ├── auth/                  # AuthContext, ProtectedRoute
│   ├── theme/                 # Dark/light mode context
│   ├── types/                 # TypeScript interfaces matching backend DTOs
│   ├── pages/                 # Route-level pages
│   └── components/            # Shared UI (Layout/nav)
```

## Data Model

```
ApplicationUser (extends IdentityUser)
 ├─ IsActive
 ├─ Roles (Admin | User, via ASP.NET Core Identity)
 ├─ TrainingPlans
 │   ├─ Races
 │   └─ Workouts
 └─ Shoes
     └─ Workouts (optional link)
```

- A `Workout` optionally links to a `Shoe`, enabling automatic mileage tracking per shoe.
- Shoe mileage is calculated on read (sum of linked workout distances), not stored, to avoid data drift.

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (18+)
- SQL Server (LocalDB is sufficient for local development)

### Backend setup

```bash
cd trainlog-api
dotnet restore
dotnet ef database update --project TrainLog.Infrastructure --startup-project TrainLog.Api
dotnet run --project TrainLog.Api
```

The API will be available at `https://localhost:{port}`, with Swagger UI at `/swagger`.

**Configuration:** Set your JWT signing key via .NET User Secrets rather than committing it to `appsettings.json`:
```bash
cd TrainLog.Api
dotnet user-secrets set "Jwt:Key" "your-generated-secret-here"
```

### Frontend setup

```bash
cd trainlog-client
npm install
npm run dev
```

Create a `.env` file with:
```
VITE_API_BASE_URL=https://localhost:{port}/api
```

The app will be available at `http://localhost:5173`.

## Key Features & Design Decisions

- **Authentication:** JWT-based, stateless — appropriate given the API and client are on separate origins. Tokens carry the user's role claim, which both the frontend (for UI display) and backend (`[Authorize(Roles = "Admin")]`, for actual enforcement) rely on.
- **Authorization boundaries (IDOR protection):** every query scopes data to the authenticated user (`UserId` match, or via a parent relationship for child entities like Workouts/Races), preventing one user from reading or modifying another user's data by guessing an ID.
- **Cascade delete strategy:** Deleting a Training Plan cascades to its Workouts and Races. Deleting a Shoe sets linked workouts' `ShoeId` to null rather than deleting workout history. Deleting a user with existing Shoes is blocked at the database level to prevent silent data loss.
- **Derived data over stored data:** Shoe mileage and dashboard totals are computed from source data at query time rather than stored and risking drift.
- **Admin safeguards:** an admin cannot deactivate their own account, remove their own Admin role, or delete themselves — preventing accidental lockouts.

## API Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Training Plans | Full CRUD — `/api/trainingplans` |
| Workouts | Full CRUD — `/api/workouts` (filterable by `trainingPlanId`) |
| Races | Full CRUD — `/api/races` (filterable by `trainingPlanId`) |
| Shoes | Full CRUD — `/api/shoes` |
| Dashboard | `GET /api/dashboard` — aggregated summary view |
| Admin | `/api/admin/users` — list, update, role management, delete (Admin role required) |

## Roadmap / Possible Extensions

- Docker containerization for both projects
- CI/CD via GitHub Actions
- Deployment to a free-tier host (API + React client + hosted SQL)
- Refresh token flow (currently uses a single JWT with a fixed expiry)
- Shared time-format validation utilities (currently duplicated across Workouts/Races pages)
