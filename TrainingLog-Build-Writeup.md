# Building TrainingLog: A Full-Stack Portfolio Project

## The Goal

The objective was to build a demo-ready full-stack web application for a job interview, meeting a specific set of technical requirements:

- API built in ASP.NET Core (Web API)
- Entity Framework Core, Code First approach
- SQL Server database
- Full CRUD (GET, POST, PUT, DELETE)
- Authentication/login
- React + TypeScript frontend, completely separated from the backend
- Version control via GitHub
- CI/CD pipeline
- Free hosting
- Full containerization

## Choosing the App Idea

Rather than build a generic to-do list or CRUD tutorial app, we picked a concept tied to a genuine personal interest: half marathon training. This became **TrainingLog** — a race and workout tracking application. Building something the developer could speak to authentically, rather than a templated demo, was a deliberate choice for interview purposes.

## Data Model

The domain was designed with enough relational complexity to demonstrate real EF Core skills — one-to-many relationships, an optional foreign key, and cascade-delete behavior — without being over-engineered:

```
ApplicationUser (extends IdentityUser)
 ├─ TrainingPlans
 │   ├─ Races
 │   └─ Workouts
 └─ Shoes
     └─ Workouts (optional link)
```

- A **TrainingPlan** belongs to a user and contains **Workouts** and **Races**.
- A **Workout** can optionally link to a **Shoe**, enabling automatic mileage tracking.
- **Shoe** mileage is deliberately *not* stored — it's calculated on read by summing linked workout distances, avoiding data drift between the stored value and reality.

## Backend Build

### Project Structure

The solution was split into three projects to demonstrate layered architecture:
- **TrainingLog.Domain** — plain entity classes, no dependencies
- **TrainingLog.Infrastructure** — EF Core `DbContext`, migrations, role seeding
- **TrainingLog.Api** — controllers, DTOs, authentication, `Program.cs`

### Authentication & Authorization

- ASP.NET Core Identity was used for user management, extended via a custom `ApplicationUser` class (adding `FirstName`, `LastName`, `IsActive`).
- Two roles were seeded at startup: `User` and `Admin`.
- JWT Bearer authentication was configured, with tokens carrying claims for the user's ID, email, and role(s).
- Every protected endpoint uses `[Authorize]`, and admin-only endpoints use `[Authorize(Roles = "Admin")]`.

### CRUD Controllers

Built out in this order, each following the same pattern — DTOs for input/output (never exposing raw entities), ownership checks scoped to the authenticated user, and full GET/POST/PUT/DELETE support:

1. **TrainingPlansController** — the root entity; plans are owned directly by a user.
2. **WorkoutsController** — owned indirectly via the parent `TrainingPlan`; includes ownership validation on both the `TrainingPlanId` and optional `ShoeId` when creating a workout, to prevent one user from attaching data to another user's records.
3. **RacesController** — nearly identical pattern to Workouts.
4. **ShoesController** — includes the computed mileage field, summed via a database query rather than stored.
5. **DashboardController** — a read-only aggregation endpoint combining data across Training Plans, Workouts, and Races into one summary view (active plan progress, upcoming race countdown, weekly mileage trends, lifetime totals).
6. **AdminController** — user management for administrators: listing users, updating profile fields and active status, managing role assignments, and deleting accounts. Includes safeguards so an admin cannot deactivate, demote, or delete their own account.

### Design Decisions Worth Noting

- **Derived data over stored data**: shoe mileage and dashboard totals are computed at query time rather than cached, preventing drift.
- **Cascade delete strategy**: deleting a Training Plan cascades to its Workouts and Races; deleting a Shoe sets linked workouts' shoe reference to null instead of deleting workout history; deleting a User with existing Shoes is blocked at the database level.
- **IDOR protection**: every query is scoped to the authenticated user's own data, whether directly (`UserId` match) or through a parent relationship, preventing one user from reading or modifying another's records by guessing an ID.

## Frontend Build

### Stack

- React + TypeScript, scaffolded with Vite
- Material UI (MUI) for components
- React Router for client-side routing
- Axios for HTTP calls
- Recharts for the dashboard's mileage chart

### Structure

```
src/
 ├─ api/          — typed API call modules, one per backend entity
 ├─ auth/         — AuthContext, ProtectedRoute
 ├─ theme/        — light/dark mode context
 ├─ types/        — TypeScript interfaces matching backend DTOs
 ├─ pages/        — route-level pages
 └─ components/   — shared UI (navigation layout)
```

### Build Order

1. **TypeScript types** mirroring every backend DTO, including careful handling of C#-to-TypeScript type mapping (`decimal` → `number`, `DateTime`/`TimeSpan` → `string`).
2. **Axios instance** with a request interceptor to automatically attach the JWT to every outgoing call, and a response interceptor to handle expired/invalid tokens by clearing storage and redirecting to login.
3. **Typed API modules**, one per entity, mirroring the backend controllers.
4. **AuthContext** — centralized login/register/logout logic and auth state, backed by `localStorage`.
5. **Login and Register pages**, with error handling that accounts for the different error response shapes the backend can return.
6. **Routing and ProtectedRoute** — a route guard component supporting both general authentication checks and admin-only route restrictions.
7. **Shared Layout** — a navigation bar with role-aware links and a logout menu.
8. **Dashboard page** — pulling from the aggregation endpoint, showing active plan progress, upcoming race countdown, and a bar chart comparing planned vs. actual weekly mileage.
9. **Training Plans, Workouts, Races, and Shoes pages** — full CRUD interfaces using MUI dialogs for create/edit forms and confirmation dialogs for deletes.
10. **Admin page** — user list with inline role management and account status toggles, mirroring the backend's self-protection safeguards in the UI.

### Notable Frontend Features

- **Auto-calculated fields**: a training plan's duration is derived from picking a start and end date rather than manually entering a week count; a workout's duration is automatically calculated from actual pace × actual distance.
- **Input masking and validation** for pace/duration fields, auto-inserting colons as digits are typed and validating the final format before allowing a save.
- **Dark mode**, implemented via a theme context that persists the user's preference and toggles MUI's palette mode app-wide.
- **Responsive navigation** — a standard inline nav bar on desktop that collapses into a hamburger-triggered drawer on mobile screen sizes.

## Containerization

- Both the API and the client were containerized with multi-stage Dockerfiles:
  - The **API** uses a .NET SDK image to build/publish, then copies the output into a smaller ASP.NET runtime image for the final container.
  - The **client** uses a Node image to run the Vite production build, then serves the resulting static files through Nginx, with a custom Nginx config to support client-side routing.
- A **Docker Compose** file was set up to run the full stack locally — API, SQL Server, and client — networked together, with the API automatically applying EF Core migrations and seeding roles on startup.
- Secrets (database password, JWT signing key) were kept out of version control via a `.env` file referenced by Compose, with a committed `.env.example` documenting the required variables.

## Deployment

The app was deployed using a mix of free-tier services chosen specifically to avoid any risk of unexpected billing:

- **Database**: Azure SQL's free tier — a genuine SQL Server instance with no time limit, keeping the EF Core SQL Server provider unchanged from local development.
- **API**: deployed as a Docker container on Render's free tier.
- **Client**: deployed to Vercel, which automatically builds and hosts the Vite production build.

CORS was configured on the API to explicitly allow the deployed client's origin, and the client's API base URL was set via a build-time environment variable pointing at the deployed API.

## Documentation

A project README was written covering the tech stack, architecture, data model, setup instructions, and the key design decisions made throughout — intended to give an interviewer a clear, fast overview of both what was built and the reasoning behind it.
