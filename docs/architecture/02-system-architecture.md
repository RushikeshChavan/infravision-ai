# InfraVision AI — System Architecture

## 1. Architecture Goals

This architecture exists to serve the product requirements defined in `01-project-overview.md` without contradicting or narrowing any confirmed decision from that document. It aims to provide:

- Strong role-based security enforced independently of the frontend
- Department-level and project-level data isolation, not just role-level isolation
- A secure, clearly bounded path for citizen/public access that never touches internal data directly
- A secure, layered path for AI data access that never touches the database directly
- Reliable project lifecycle management, milestone and progress tracking, and admin-only budget distribution alongside role-scoped budget monitoring
- Contractor management with accountability data suitable for both manual review and AI-assisted assessment
- Inspection/event-based GPS and GIS functionality (not continuous tracking)
- Server-side analytics, report generation, document management, and immutable audit logging
- A clean separation between frontend, backend, database, and external services
- Maintainability and a credible path to scale beyond the hackathon MVP

This architecture is intentionally scoped for a hackathon build: it favors a single, well-organized backend over distributed infrastructure, and it avoids technology or complexity that isn't justified by a requirement already established in the project overview.

## 2. Architecture Overview

InfraVision AI is built as a **modular monolith**: one backend application internally organized into clearly bounded modules (Projects, Budgets, Contractors, AI, etc.), rather than a set of independently deployed microservices. This is a deliberate choice, not a shortcut — module boundaries inside the monolith are designed so that, if the product ever needed to split a module out later, it could do so without a full rewrite. For the current scope, a modular monolith gives the team one deployable unit, one database connection pool, and one place to enforce authorization consistently, which matters more for a secure government platform than independent scaling of individual features.

The system has five conceptual planes that recur throughout this document:

1. **Presentation plane** — the React frontend, rendering role-appropriate UI and never itself deciding what data a user may see.
2. **Access control plane** — authentication and authorization, evaluated on every request, independent of what the frontend requested or rendered.
3. **Application plane** — the backend's business logic, organized into modules.
4. **Data plane** — MongoDB, document storage, and the repositories that mediate access to them.
5. **Intelligence and integration plane** — the AI layer and external services (LLM provider, map tiles), which sit downstream of the access control plane and never bypass it.

## 3. High-Level System Architecture

```text
Users (all 7 roles)
  ↓
Frontend (React SPA)
  ↓
API / Backend (Node.js + Express)
  ↓
Authentication + Authorization
  ↓
Application Services (modular)
  ↓
Data Access Layer (Repositories)
  ↓
MongoDB

```

Alongside this primary vertical flow, several supporting subsystems attach to the backend rather than to the frontend directly:

```text
                     ┌──────────────────────┐
                     │   Application Services│
                     └──────────┬────────────┘
        ┌───────────────┬───────┼───────┬────────────────┬───────────────┐
        ↓               ↓       ↓       ↓                ↓               ↓
   AI Layer      Document/File   GIS/Map        Report          Notification /   Audit
 (Citizen/Admin/   Storage      Services       Generation        Real-Time         Logging
  Contractor Performance AI)  (metadata in  (Leaflet +      (PDF /            Layer            (append-
                   MongoDB)     OpenStreetMap   spreadsheet)      (Socket.IO)       only store)
                                 tiles, no
                                 server-side
                                 storage of
                                 map data)

```

**Responsibility of each layer:**

- **Frontend:** Renders role-appropriate views, collects input, calls backend APIs, and enforces UI-level route protection as a UX convenience only — never as a security boundary.
- **Authentication + Authorization:** Confirms identity (authentication) and then determines effective access (authorization) for every single request, regardless of what the frontend intended.
- **Application Services:** Contains all business logic — project lifecycle rules, budget distribution rules, milestone evidence rules, contractor assignment rules — organized by module.
- **Data Access Layer:** The only part of the system permitted to talk to MongoDB. Services never issue raw queries directly; they go through repositories.
- **MongoDB:** The system of record for all structured data.
- **AI Layer:** Receives only pre-authorized, pre-filtered data from the application/data layers; never queries MongoDB directly (see Section 11).
- **Document/File Storage:** Holds file content; MongoDB holds metadata and access classification, never raw unrestricted file URLs.
- **GIS/Map Services:** Leaflet + OpenStreetMap tiles are rendered client-side; the backend supplies only the coordinate data a user is authorized to see.
- **Report Generation:** Produces PDF/spreadsheet output from already-authorized, already-filtered data — it does not perform its own authorization logic.
- **Notification/Real-Time Layer:** Socket.IO pushes updates for a defined set of events; it is not the backbone of core CRUD operations.
- **Audit Logging:** Records significant actions as an independent, append-only concern that no other module can rewrite.

## 4. Frontend Architecture

The frontend is a React + TypeScript single-page application built with Vite, styled with Tailwind CSS and shadcn/ui, organized around **features** rather than technical layers, so that a developer working on "Milestones" or "Citizen Portal" can find nearly everything relevant in one place.

Conceptual structure:

```text
src/
  app/            → application bootstrap, providers, root layout wiring
  components/      → shared, reusable UI primitives (buttons, tables, modals)
  features/        → one folder per business capability (projects, budgets,
                     contractors, milestones, gis, analytics, citizen-portal,
                     admin-ai, reports, auth, notifications, ...)
  layouts/         → role-specific shell layouts (Admin layout, Citizen layout,
                     Contractor layout, etc.)
  pages/           → route-level components that compose features + layouts
  services/        → API client modules (one per backend module), response
                     typing, error normalization
  hooks/           → shared React hooks (auth state, permissions, data fetching)
  lib/             → framework-agnostic utilities (formatting, validation
                     helpers, constants)
  types/           → shared TypeScript types/interfaces, especially ones that
                     mirror backend DTOs
  routes/          → route definitions and role-based route guarding

```

**Why this structure fits:** A government monitoring platform with seven roles and \~19 modules risks becoming unnavigable if organized purely by technical layer (all components in one place, all hooks in another). Feature-oriented organization keeps each module's UI, API calls, and local state together, while `components/` and `lib/` prevent duplication of genuinely shared building blocks. This mirrors the module boundaries used on the backend (Section 4 vs. Section 5), which keeps the mental model consistent across the stack.

**Key concerns and how they're addressed conceptually:**

- **Authentication state:** Held in a top-level provider populated after login; carries the current user's role, department scope, and project assignments so the UI can adapt without re-fetching on every navigation.
- **Role-based route protection:** Routes are guarded based on the authenticated user's role and scope, redirecting unauthorized navigation attempts. This exists purely for usability — it prevents an authorized-but-wrong-role user from _seeing_ a screen that would fail server-side anyway. It is explicitly **not** the security boundary (see Section 8).
- **Dashboard structure:** Each role has its own dashboard composed from shared widgets (status summary, budget snapshot, map, alerts) configured differently per role, rather than one dashboard with conditional rendering sprawl.
- **Shared UI components:** Tables, cards, modals, form controls, and chart wrappers live in `components/` and are consumed by every feature, keeping visual consistency without duplicating logic.
- **API communication:** Centralized in `services/`, one module per backend domain, so error handling, auth headers, and response typing are consistent everywhere a feature calls the backend.
- **Error handling:** API errors are normalized into a consistent shape at the service layer and surfaced through shared UI patterns (toasts, inline form errors, full-page error states) rather than each feature inventing its own handling.
- **Loading states:** Handled consistently through shared hooks/components so dashboards, tables, and forms all present a predictable loading experience.
- **Form validation:** Client-side validation improves UX and reduces round-trips, but every rule is re-enforced server-side — the frontend validation is a convenience layer, not a security or integrity guarantee.
- **Map integration:** A shared map component wraps Leaflet/OpenStreetMap and is reused across the project map, inspection map, and citizen map, each configured with the data and interactivity appropriate to its role.
- **Charts/analytics integration:** A shared charting layer renders the analytics defined in Section 19, fed exclusively by backend endpoints that have already applied role/department/project scoping.
- **Report download handling:** The frontend requests report generation and handles the resulting file download; it does not generate or assemble report content itself.
- **Notification handling:** A shared notification hook subscribes to the real-time layer (Section 21) and to a fallback polling/inbox pattern, so notifications degrade gracefully if a real-time connection isn't available.

## 5. Backend Architecture

The backend is a single Node.js + Express + TypeScript application using a **layered, modular architecture**:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Authorization
  ↓
Repositories / Data Access
  ↓
MongoDB

```

**Layer responsibilities:**

- **Routes:** Declare available endpoints and attach middleware (authentication, authorization, validation) — no business logic here.
- **Controllers:** Translate HTTP requests into service calls and translate service results into HTTP responses. Controllers handle request/response shape, not business rules.
- **Services:** Contain the actual business logic for a module — e.g., "a milestone cannot be marked complete without evidence," "budget distribution requires Department Admin or Super Admin." Services are where module-specific rules live.
- **Authorization:** A cross-cutting concern invoked by services (and enforced earlier by middleware, see Section 8) that checks role, department scope, project assignment, and data classification before a service proceeds or a repository is queried.
- **Repositories / Data Access:** The only layer that constructs MongoDB queries. Services never query MongoDB directly, which keeps data-shape and indexing concerns out of business logic and makes authorization scoping easier to enforce consistently.
- **MongoDB:** The persistent store.

**Backend modules** (each a bounded folder within the single application, not a separate service):

- Authentication
- Users
- Departments
- Projects
- Project Planning
- Milestones
- Budgets (split internally into Distribution vs. Monitoring, per Section 18)
- Contractors
- Field Inspections (GPS/GIS)
- Documents
- Analytics
- Notifications
- Citizen Portal
- Citizen AI
- Admin AI
- Contractor Performance Assessment
- Reports
- Audit Logs

Each module owns its own controllers, services, and repositories, and communicates with other modules through service-level function calls (in-process), not network calls — this is what makes it a modular monolith rather than a microservice mesh. A module boundary here is an organizational and dependency-management boundary, not a deployment boundary.

## 6. Request Lifecycle

Every request that touches non-public data follows the same lifecycle:

```text
Client
  ↓
HTTP request
  ↓
Authentication middleware   (Who are you? — verifies JWT)
  ↓
Role/permission middleware  (What are you generally allowed to do?)
  ↓
Input validation            (Is this request well-formed?)
  ↓
Controller
  ↓
Service                     (business logic + fine-grained authorization,
  ↓                          e.g. "is this project in your department?")
Repository
  ↓
MongoDB
  ↓
Service response
  ↓
Controller
  ↓
Response sanitization       (strip fields the requester isn't authorized
  ↓                          to see, even within an otherwise-authorized
  ↓                          record)
Client

```

**Where things happen:**

- **Errors** are caught by a centralized error-handling middleware (Section 22) positioned after the route handlers, so every layer can throw a typed error and trust it will be converted into a consistent, safe HTTP response.
- **Authorization** happens twice, deliberately: coarse-grained at the middleware level (does this role ever have access to this route?) and fine-grained inside the service (does this specific user have access to this specific department/project/resource?). Relying on middleware alone would miss record-level checks like "this Project Manager is authorized for Projects in general, but not for this particular project."
- **Audit logging** is triggered from the service layer, after an action succeeds, for any action on the audit-relevant list in Section 21 — never from the controller, so that logging reflects what actually happened in business logic, not just what was requested.

Public/citizen requests follow a simpler, parallel lifecycle described in Section 10.

## 7. Authentication Architecture

Authentication answers **"who are you?"** and nothing more — it does not decide what an authenticated user can access.

Conceptual components:

- **Login:** Credentials are verified against a stored, hashed password; successful login issues a JWT.
- **Password hashing:** Passwords are never stored in plaintext or in a reversible form; a strong, salted hashing algorithm is used at rest.
- **JWT access token:** Issued on login, carrying the user's identity and enough claims (user ID, role) to avoid a database round-trip on every request for basic identity, while full department/project scope is still authoritatively loaded/verified server-side rather than trusted blindly from the token.
- **Token validation:** Every protected request verifies the JWT's signature and expiration before anything else happens.
- **Session/logout strategy:** Logout invalidates the client's ability to use the token going forward (e.g., short-lived tokens plus a server-side invalidation mechanism for sensitive cases such as forced logout or account deactivation).
- **Token expiration:** Access tokens are short-lived by design; expired tokens require re-authentication rather than being trusted indefinitely.
- **Password reset:** A secure, time-limited reset flow that never emails or displays a plaintext password.
- **Account deactivation:** A deactivated account's tokens must be rejected going forward, even if not yet expired.
- **Role loading:** The user's role is established at login and re-verified server-side on sensitive operations rather than trusted purely from a stale token claim.
- **Department/project scope loading:** A user's department and project assignments are loaded from the data layer at authorization time (Section 8), not baked permanently into the token, so a scope change (e.g., reassigning a Project Manager) takes effect without requiring the user to somehow invalidate an old token.

Authorization — "what are you allowed to access?" — is deliberately a separate concern, covered next.

## 8. Authorization and RBAC Architecture

This is the most important section of this document, because it is what makes department/project-level isolation and citizen data protection actually hold.

**Authorization is enforced server-side, on every request, regardless of what the frontend rendered or intended.** Frontend route protection (Section 4) is a UX convenience; it is never treated as a security control, because a client can always be bypassed, inspected, or scripted around.

Authorization is layered across four dimensions:

1. **Role level** — Does this role ever have access to this capability at all? (e.g., only Super Admin and Department Admin can ever reach budget distribution endpoints.)
2. **Department level** — Is this resource within the department this user belongs to (for Department Admin) or is authorized platform-wide (Super Admin)?
3. **Project assignment level** — Is this resource within a project this specific user (Project Manager, Field Engineer, Contractor) is explicitly assigned to?
4. **Resource/data classification level** — Even within an authorized record, is this particular field/document classified at a level this role may see (Section 9)?

Representative scope per role, as established in the project overview and unchanged here:

```text
Super Admin      → platform-wide
Department Admin → own department
Project Manager  → assigned projects
Field Engineer   → assigned inspections/projects
Contractor       → assigned projects only, own performance data
Auditor          → assigned departments/projects, read-only
Citizen          → public-safe data only, via a separate path (Section 10)

```

**Conceptual permission model:**

```text
Role
  +
Department Scope
  +
Project Scope
  +
Resource Classification
  =
Effective Access

```

Every authorization check evaluates all four dimensions together, not just role. A Department Admin passing the role check is not automatically authorized for a project outside their department; a Project Manager passing the role and department check is not automatically authorized for a project they aren't assigned to; and any authorized user is still subject to field-level classification filtering before a response leaves the backend (Section 6's "response sanitization" step).

The detailed permission database schema (roles table, scope tables, classification enums, etc.) is intentionally deferred to the forthcoming database architecture document — this section defines the model conceptually so that document can implement it consistently.

## 9. Data Classification Architecture

All data in the system is conceptually classified into one of four levels, and this classification — not just role — governs visibility.

- **PUBLIC** — Safe for unauthenticated citizens. _Examples: project name, public status, public progress percentage, public location, public budget summary (approved budget, utilization, utilization %), public updates, public milestones._
- **INTERNAL** — Visible to authenticated internal roles generally, but never to citizens. _Examples: internal project notes, internal progress detail beyond the public summary, non-sensitive coordination information._
- **RESTRICTED** — Visible only to roles/scopes with a specific need, even among internal users. _Examples: internal documents, detailed line-item budget information, audit-relevant records, detailed contractor assignment terms._
- **CONFIDENTIAL** — Visible only to the narrowest authorized set, typically Super Admin/Department Admin and, for their own data, the subject. _Examples: sensitive financial information, personally identifiable information, internal contractor risk/financial information, internal AI assessment reasoning._

**How classification affects access:** Every field or document carries (conceptually) a classification tag. Authorization (Section 8) determines whether a user's role/department/project scope generally permits reaching a resource; classification then determines which _fields within_ that resource are actually returned. This is what allows, for example, a Contractor and a Department Admin to both legitimately view "their" project record while seeing materially different data — the Contractor's response is filtered down to PUBLIC/INTERNAL fields relevant to their assignment plus their own basic performance indicators, while the Department Admin's response includes RESTRICTED budget and CONFIDENTIAL contractor detail.

## 10. Citizen/Public Architecture

Citizens must never have a code path that reaches raw MongoDB collections, even indirectly. The public path is architecturally separate from the internal authenticated path:

```text
Citizen
  ↓
Public API (unauthenticated, rate-limited)
  ↓
Public Data Service
  ↓
Public-safe projection / filtering (PUBLIC classification only)
  ↓
Response

```

**Key principles:**

- Public endpoints are distinct from internal endpoints — they are not "internal endpoints with a citizen role attached." This keeps the set of fields a public request can possibly touch small, explicit, and easy to audit.
- The Public Data Service only ever queries or projects fields classified PUBLIC (Section 9). Draft, unapproved, INTERNAL, RESTRICTED, and CONFIDENTIAL data must never reach this layer, let alone the citizen.
- This same principle governs the public map (only PUBLIC location data), public reports (Section 20's "Public project summary"), and the citizen chatbot (Section 12) — all three are built on top of the same Public Data Service rather than each independently deciding what counts as safe.
- Public endpoints are rate-limited to protect against abuse, given they require no authentication.

## 11. AI Architecture

This section follows, without modification, the AI architecture already approved in the project overview.

```text
Database
  ↓
Authorization
  ↓
Data Access / Service Layer
  ↓
AI Context / Retrieval Layer
  ↓
LLM Provider
  ↓
Response Validation / Filtering
  ↓
User

```

The AI layer sits downstream of authorization and the data access layer — it consumes already-scoped data, it does not decide scope itself. This is enforced architecturally, not just as a guideline:

The AI must **never**:

- Connect directly to MongoDB
- Bypass authorization
- Decide what data a user can access
- Perform database writes without going through the normal, controlled backend service/authorization workflow
- Automatically approve budgets
- Automatically distribute funds
- Automatically punish, blacklist, terminate, or reject a contractor
- Make any legally binding government decision

The provider-agnostic LLM abstraction layer (per the approved technology direction) sits at the "LLM Provider" step, so the specific provider can change without altering the authorization or context-building logic around it. A failure or unavailability of the LLM provider must not affect any non-AI functionality (see Section 22).

## 12. Citizen AI Architecture

The citizen chatbot is a distinct capability built strictly on top of the citizen/public path defined in Section 10 — it does not get its own, separately-authorized route into internal data.

```text
Citizen
  ↓
Citizen Chat API (unauthenticated, rate-limited)
  ↓
Public-safe authorization (same boundary as Section 10)
  ↓
Public data retrieval (Public Data Service)
  ↓
Context builder (assembles only PUBLIC-classified data into a prompt context)
  ↓
LLM
  ↓
Response validation (checks the response doesn't leak anything outside the
  ↓                   supplied public context)
Citizen

```

**Can answer:** project status, progress, milestones, expected completion, location, high-level public budget figures, public updates.

**Cannot access, at the retrieval level (not merely filtered out of the response):** internal documents, confidential budgets, PII, internal notes, audit findings, contractor private information, internal AI assessment reasoning. Because the context builder only ever receives PUBLIC-classified data in the first place, there is no non-public data available for the LLM to leak even under adversarial prompting — the boundary is enforced before the LLM sees anything, and checked again after.

## 13. Admin AI Architecture

The admin AI assistant runs entirely inside the authenticated, authorized path — it is not reachable without a valid session and passes through the same RBAC/scope checks as any other authenticated request.

```text
Admin (Super Admin / Department Admin / Project Manager / Auditor)
  ↓
Authenticated AI request
  ↓
JWT verification + RBAC + department/project scope validation (Section 8)
  ↓
Authorized data retrieval (only what this specific user may see)
  ↓
Context preparation
  ↓
LLM
  ↓
Output validation
  ↓
Admin

```

**Can analyze:** project status, budget (within the requester's authorized scope), milestones, schedule, contractor performance indicators, trends, risks, delays, anomalies.

**Must respect:** the requesting user's department/project scope exactly as every other module does — a Project Manager's Admin AI session can only ever be given data about projects that Project Manager is assigned to; it is not a backdoor to platform-wide data. Output is decision support only, per Section 11's decision boundary.

## 14. Contractor Performance AI Architecture

Contractor performance assessment is a distinct, admin-only capability layered on top of the Admin AI architecture in Section 13, not a general-purpose feature available to Project Managers or Auditors by default.

**Data sources (all already authorized/aggregated before reaching the AI):**

- Milestone completion history
- Schedule performance
- Delay history
- Field inspection outcomes
- Evidence-backed progress records
- Project-level performance history

```text
Authorized Admin (Department Admin / Super Admin only)
  ↓
RBAC validation (admin-only gate)
  ↓
Authorized contractor/project data
  ↓
Performance aggregation (deterministic, non-AI summarization of the raw data)
  ↓
AI assessment (interprets the aggregated data)
  ↓
Risk / insight / recommendation output
  ↓
Admin review

```

The output is explicitly advisory. The system architecture must never wire this output directly into an automated action — there is no code path from "AI assessment" to blacklisting, terminating, rejecting, or legally classifying a contractor. Any such outcome requires a separate, human-initiated administrative action, which is itself audit-logged (Section 21) independently of the AI assessment that may have informed it. Contractors themselves never see this assessment or its underlying reasoning (per Section 9's CONFIDENTIAL classification) — they see only their own basic performance indicators, generated through the ordinary Milestones/Contractor modules rather than this AI path.

## 15. Project Lifecycle Architecture

The platform's core end-to-end story, and the roles that interact at each stage:

```text
Project Creation           → Department Admin
  ↓
Planning                   → Project Manager, Department Admin
  ↓
Approval                   → Department Admin
  ↓
Budget Allocation          → Department Admin, Super Admin (distribution)
  ↓
Contractor Assignment      → Department Admin, Project Manager
  ↓
Milestone Definition       → Project Manager
  ↓
Execution                  → Project Manager, Contractor
  ↓
Field Inspection           → Field Engineer
  ↓
GPS + Evidence             → Field Engineer (captured during inspection)
  ↓
Progress Update            → Field Engineer, Project Manager, Contractor
  ↓
Budget Monitoring          → Project Manager, Field Engineer, Department Admin, Contractor, Auditor (read, role-scoped)
  ↓
Analytics                  → Department Admin, Project Manager, Auditor,
  ↓                           Super Admin
AI Insights                → Admin AI: Super Admin, Department Admin, Project Manager, Auditor
  ↓
  Performance Assessment: Department Admin, Super Admin only.
Reports                    → Role-scoped, per Section 20
  ↓
Completion                 → Department Admin, Project Manager
  ↓
Citizen Transparency       → Citizen (via the public path, Section 10)

```

Each stage writes through the standard request lifecycle (Section 6), so authorization and, where applicable, audit logging (Section 21) apply uniformly regardless of which lifecycle stage triggered the request.

## 16. GPS/GIS Architecture

Per the approved project overview, MVP GPS is strictly **inspection/event-based** — there is no continuous tracking architecture in this document.

```text
Field Engineer
  ↓
Opens an assigned project and starts an inspection
  ↓
Browser/device location permission requested
  ↓
GPS coordinates captured at the moment of inspection
  ↓
Inspection record (coordinates + timestamp + notes + evidence)
  ↓
Backend validation (is this user assigned to this project? is the payload
  ↓                  well-formed?)
MongoDB
  ↓
Map visualization (role-appropriate: internal map shows full detail,
                    public map shows only approved project-level location)

```

**Stored conceptually, per inspection:**

- latitude
- longitude
- timestamp
- associated project
- associated inspection/progress record
- authorized user who captured it

**GIS supports:**

- Project location markers (available at the PUBLIC classification level, in reduced form, for the citizen map)
- Inspection location markers (internal roles only)
- Progress evidence locations (tied to the inspection they belong to)
- Geographic filtering of project lists and analytics by region/department/map area
- A public-safe project map built on the same Public Data Service as the rest of the citizen path (Section 10)

There is no background location service, device polling loop, or persistent tracking session in this architecture — GPS data only ever enters the system as a byproduct of an explicit inspection action.

## 17. Document Architecture

```text
Upload
  ↓
Authentication
  ↓
Authorization (role/department/project scope + intended classification)
  ↓
Validation (file type, size, basic content checks)
  ↓
File storage (content)
  ↓
Metadata in MongoDB (filename, classification, owning project, uploader,
  ↓                    timestamps — never the raw unrestricted file URL)
Access-controlled retrieval (every download request re-checks authorization
                               and classification before returning content)

```

**Key principles:**

- Every document carries a classification (Section 9). A document's classification governs who can retrieve it, independent of whether the requester can see the project it's attached to — being authorized for a project does not automatically mean being authorized for every document on it (e.g., a RESTRICTED internal audit note attached to a project a Contractor can otherwise access).
- The system never exposes a direct, unauthenticated, unrestricted URL to file content. Retrieval always passes back through authorization, even for previously-accessed files.
- **Public documents** (explicitly classified PUBLIC — e.g., a public project update attachment) are retrievable through the same public path as other citizen-facing data (Section 10). **Restricted/internal/confidential documents** are only reachable through the authenticated, authorized internal path and are never projected into the public or citizen-AI data layers.

## 18. Budget Architecture

Budget functionality is architecturally split into three distinct concerns, matching the confirmed product decisions:

**Budget Distribution**

- Who: Super Admin, Department Admin only.
- What: Creating, modifying, and distributing budget allocations across projects/phases/categories.
- Enforcement: Gated at the role level (Section 8, dimension 1) before any distribution-related service logic runs; Project Manager, Field Engineer, Contractor, and Auditor have no route into this capability.

**Budget Monitoring**

- Who: Super Admin, Department Admin, Project Manager, Field Engineer, Contractor, and Auditor, each scoped to what they're otherwise authorized to see (department for Department Admin, assigned projects for Project Manager/Field Engineer/Contractor, assigned scope for Auditor). Field Engineer has limited read-only budget visibility for assigned projects only and has no budget modification, allocation, distribution, or approval authority.
- What: Read-only visibility into budget-vs-actual figures, distribution breakdowns, and variance, filtered by classification (Section 9) — e.g., a Contractor sees budget context relevant to their own assigned work, not department-wide financial detail.
- Enforcement: Same authorization pipeline as any other read (Section 6), with RESTRICTED-classified line-item detail withheld from roles not authorized for it. Field Engineer access is limited to assigned projects and remains strictly read-only; the role has no budget modification, allocation, distribution, or approval route.

**Public Budget Transparency**

- Who: Citizen, via the public path only (Section 10).
- What: High-level, PUBLIC-classified figures only — approved budget, publicly releasable utilization amount, and utilization percentage.
- Enforcement: Served exclusively through the Public Data Service; the citizen path has no route to Budget Distribution or Budget Monitoring endpoints, only to the pre-projected public summary.

These three concerns share the same underlying budget data in MongoDB but are accessed through entirely different service methods and authorization gates — there is no single "budget endpoint" that branches on role after the fact; the separation exists at the module/route level.

## 19. Analytics Architecture

Analytics are generated from data the requesting user is already authorized to see — the analytics layer does not have its own, broader access to underlying data than the user requesting it.

**Required analytics (all MVP, per the approved project overview):**

- Comparative project analytics
- Trend analysis
- Budget vs. actual
- Schedule variance
- Contractor performance indicators
- Delayed project detection
- Over-budget detection
- Geographic distribution

**Architecture:** For MVP, analytics are computed via **server-side aggregation** over already-scoped queries (e.g., MongoDB aggregation pipelines constrained by the same department/project scope used elsewhere), executed at request time or on a light caching layer if needed for dashboard performance. There is no separate analytics database or data warehouse — introducing one would add operational complexity disproportionate to the hackathon's data volumes and isn't required by any confirmed product decision.

**Scoping:** A Department Admin's comparative analytics only ever aggregate their own department's projects; a Project Manager's trend analysis only ever covers their assigned projects; Super Admin is the only role whose analytics are platform-wide. This mirrors Section 8 exactly — analytics is a read pattern, not a separate authorization system.

## 20. Report Generation Architecture

```text
User
  ↓
Report request
  ↓
Authorization (role + scope, same as any other read)
  ↓
Data retrieval (already scoped to the requester)
  ↓
Data filtering (classification-based field filtering, per Section 9)
  ↓
Report generation (PDF / spreadsheet)
  ↓
Secure download (authenticated for internal reports; public path for the
                   citizen/public summary)

```

**Required reports and how they're scoped:**

- **Project progress report** — Project Manager, Department Admin, Super Admin; scoped to authorized projects.
- **Budget utilization report** — Department Admin, Auditor, Super Admin; scoped to authorized departments/projects, using Budget Monitoring data (Section 18), never Distribution-only detail beyond what the requester could already see on-screen.
- **Contractor performance report** — Department Admin, Super Admin; may include Contractor Performance AI output (Section 14) since both are admin-only.
- **Delayed project report** — Department Admin, Project Manager, Super Admin; scoped to authorized projects.
- **Department summary** — Department Admin, Super Admin.
- **Public project summary** — Generated through the Public Data Service (Section 10); requires no authentication, and structurally cannot include anything beyond PUBLIC classification because it's built from the same projection used elsewhere in the citizen path.

Report generation never performs its own, separate authorization logic — it reuses the same authorization and classification-filtering steps as the underlying data reads, so a report can never surface more than the equivalent on-screen view would.

## 21. Real-Time Architecture

Socket.IO is used selectively, where it adds meaningful value, not as the backbone of the application:

- Notifications (milestone due/overdue, budget threshold reached, new assignment)
- Live project progress updates on dashboards already open in a browser
- Milestone status changes visible to relevant assigned users
- Select important dashboard updates (e.g., a newly flagged delayed/over-budget project)

**What real-time does not do:** Core CRUD operations (creating a project, submitting an inspection, uploading a document, generating a report) all work over normal, authenticated HTTP APIs and do not depend on an active socket connection. Real-time is additive — if a client's socket connection drops, the application remains fully functional through standard request/response, and the client can resynchronize on reconnect or next page load rather than being blocked. Socket connections are authenticated the same way HTTP requests are, and a client only receives events it's authorized to see (e.g., a Contractor's socket session does not receive another department's notifications).

## 22. Audit Logging Architecture

**Operations that create audit events include:**

- Login/security events (successful login, failed login attempts, logout, password reset)
- Role or scope changes
- Project creation and approval
- Budget distribution and budget changes
- Milestone approval/completion
- Contractor assignment
- Access to RESTRICTED or CONFIDENTIAL documents
- AI assessment generation (Contractor Performance AI, in particular)
- Other significant administrative actions (account deactivation, department configuration changes)

**Audit log properties, enforced architecturally:**

- **Append-only** — the audit module exposes no update or delete operation to any other part of the application, including admin-facing ones.
- **Server-generated** — audit entries are created by the service layer as a side effect of a successful business action, never accepted as client-supplied input.
- **Timestamped** — every entry carries a server-side timestamp, not a client-supplied one.
- **Associated with the acting user** — derived from the authenticated session, not from request body data.
- **Associated with the target resource** — the specific project, budget record, document, or contractor the action affected.
- **Non-editable through normal application operations** — even Super Admin, who has broad read access to audit logs (Section 7.1 of the project overview), has no application-level path to modify or delete an existing entry.

Audit logging is invoked from the service layer (Section 6), after an action succeeds, so a failed or rejected action (e.g., an authorization failure) does not produce a misleading "success" audit entry — though authentication/authorization _failures themselves_ are separately logged as security events.

## 23. Error Handling Architecture

A centralized error-handling strategy sits at the end of the request pipeline (Section 6), converting typed errors thrown anywhere in the application into consistent, safe HTTP responses that never leak internal implementation detail.

**Conceptual categories handled:**

- **Validation errors** — malformed or missing input, returned with enough detail to fix the request but no internal detail.
- **Authentication errors** — missing/invalid/expired token, returned uniformly regardless of _why_ authentication failed, to avoid leaking account existence.
- **Authorization errors** — role/scope/classification checks failing, returned without revealing whether the underlying resource exists (to avoid leaking information through error responses, e.g., distinguishing "not found" from "not authorized").
- **Resource not found** — genuinely missing resources.
- **Duplicate data** — conflicting unique fields (e.g., duplicate user email).
- **File upload errors** — invalid type, size limits exceeded, storage failures.
- **External API failures** — map tile provider or other external dependency issues, surfaced as a degraded (not broken) experience.
- **AI failures** — LLM provider errors, timeouts, or rate limits. **AI failure must never break core project management functionality** — if the Admin AI assistant or Citizen chatbot is unavailable, all other modules (projects, milestones, budgets, documents, reports) continue operating normally, since AI is architecturally downstream and additive, not a dependency of core CRUD flows.
- **Database failures** — connection or query failures, surfaced as a generic service-unavailable response rather than raw database error detail.
- **Rate-limit errors** — clear, consistent responses on public and AI endpoints when limits are exceeded.

## 24. Security Architecture

Security in this system is **defense in depth** — no single technology choice is treated as sufficient on its own.

- **Secure authentication** — hashed passwords, short-lived JWTs, secure reset flow (Section 7).
- **Server-side authorization** — enforced on every request, independent of frontend behavior (Section 8).
- **Input validation** — applied at the route/controller boundary before any business logic runs.
- **Output sanitization** — classification-based field filtering applied before any response leaves the backend (Sections 6, 9).
- **Rate limiting** — applied especially to public and AI endpoints, which are reachable without authentication.
- **Secure headers and CORS policy** — the API only accepts requests from approved origins and sets standard protective headers.
- **Password hashing** — never plaintext, never reversible.
- **JWT security** — short expiration, signature verification on every request, no sensitive data embedded in token claims beyond what's needed for identity.
- **File validation** — type/size checks on upload, classification enforcement on retrieval (Section 17).
- **Document access control** — no unrestricted file URLs (Section 17).
- **Data classification** — the backbone of who sees what within an otherwise-authorized resource (Section 9).
- **Audit logging** — an independent, append-only accountability trail (Section 21).
- **AI isolation** — no direct AI-to-database path; AI only ever receives pre-authorized data (Section 11).
- **Public API isolation** — a structurally separate path from internal APIs, not a role-gated branch of the same endpoints (Section 10).
- **Protection against unauthorized API calls** — every non-public endpoint requires valid authentication and passes authorization before touching data.
- **Protection against IDOR** — resource access always re-validates that the requester is authorized for _that specific_ resource (department/project/document), not just for the resource type in general.
- **Protection against injection attacks** — all queries go through the repository layer using parameterized/ODM-safe query construction (Mongoose), never raw string-built queries from user input.
- **Protection against privilege escalation** — role and scope are established server-side from the authenticated session and stored user record, never accepted from client-supplied request data.

No individual item on this list is described as making the system secure by itself; security is the combined effect of all of these layers operating together, consistent with the principle established in the project overview.

## 25. External Services

Only externally-required dependencies are introduced:

- **LLM provider** — accessed only through the provider abstraction layer (Section 11), so the specific vendor can change without altering the surrounding architecture.
- **OpenStreetMap / map tiles** — consumed client-side by the frontend's Leaflet integration for rendering; the backend supplies coordinate data, not map tiles.
- **Email/notification service (optional)** — only if needed for password reset or notification delivery beyond in-app/real-time notification; not assumed as a hard requirement of this architecture.
- **File storage** — if file content is stored outside the primary application server (e.g., a managed object storage service) rather than on local disk, it is treated as an external dependency with the same access-controlled retrieval principle described in Section 17.

**Hard constraint:** all external API keys and secrets are held server-side only, in environment configuration, and are never exposed to or embedded in the frontend bundle.

## 26. Deployment Architecture

A realistic, hackathon-appropriate deployment:

```text
Browser
  ↓
Frontend Hosting (static build of the React SPA)
  ↓
Backend API (single Node.js/Express application)
  ↓
MongoDB (managed instance)
  ↓
External APIs (LLM provider, map tiles)

```

**Environment separation:**

- **Development** — local or shared dev environment, non-production data, relaxed logging verbosity for debugging.
- **Testing** — an environment for validating changes before demo, ideally mirroring production configuration closely enough to catch environment-specific issues.
- **Production/Demo** — the environment used for the actual hackathon demonstration, with production-appropriate secrets and rate limits.

**Secrets and configuration** are stored in environment variables/configuration specific to each environment, never committed to source control and never bundled into the frontend build. The backend is the only component that reads secrets such as the database connection string, JWT signing key, and LLM provider API key.

This architecture deliberately does **not** require Kubernetes, container orchestration, or multi-service deployment coordination — a single backend process, a single frontend static build, and a managed MongoDB instance are sufficient for the confirmed MVP scope, and introducing orchestration complexity here would not serve any requirement from the project overview.

## 27. Scalability and Maintainability

The modular monolith is structured so it can grow without a rewrite:

- **More departments/projects/users** — handled by the existing department/project scoping model (Section 8); no structural change needed, only data growth.
- **More analytics** — new aggregation queries added within the existing Analytics module (Section 19); the server-side aggregation approach scales incrementally with better indexing before a data warehouse would ever be justified.
- **More AI capabilities** — new capabilities added as additional consumers of the same layered AI architecture (Section 11), reusing the existing authorization-then-context-then-LLM pipeline rather than inventing a new access path each time.
- **Mobile client** — since the backend already exposes a clean API layer consumed by the web frontend, a future mobile client would consume the same APIs rather than requiring backend changes.
- **External integrations** — the modular structure (Section 5) means a future integration (e.g., an external financial system) can be added as a new module or an extension of an existing one, without requiring changes to unrelated modules.

None of this requires microservices for the scope this project is likely to reach; the module boundaries already in place are what would make a future, genuinely-justified split possible later, without that split being necessary now.

## 28. Architecture Decisions

| Decision Reason Status                                                  |                                                                                                                   |           |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------- |
| Modular monolith (not microservices)                                    | Simpler to build, secure, and demo within a hackathon timeframe; module boundaries still support future evolution | Confirmed |
| React + TypeScript frontend                                             | Matches approved technology direction; strong typing reduces integration errors with the backend                  | Confirmed |
| Node.js + Express + TypeScript backend                                  | Matches approved technology direction; consistent language across stack                                           | Confirmed |
| MongoDB + Mongoose                                                      | Matches approved technology direction; flexible schema suits varied project/document data                         | Confirmed |
| JWT authentication                                                      | Stateless, standard approach suitable for the access-token model described in Section 7                           | Confirmed |
| RBAC + department/project scope-based authorization                     | Required by the confirmed multi-role, multi-department isolation requirements                                     | Confirmed |
| Leaflet / OpenStreetMap                                                 | Matches approved technology direction; no licensing overhead for a hackathon                                      | Confirmed |
| Socket.IO for selective real-time functionality only                    | Adds real-time value where it matters without making core flows dependent on it                                   | Confirmed |
| Provider-agnostic AI layer                                              | Required by the approved technology direction; avoids vendor lock-in                                              | Confirmed |
| Public-safe data access layer, structurally separate from internal APIs | Required to guarantee citizens and the citizen AI can never reach internal data                                   | Confirmed |
| Event-based GPS (no continuous tracking)                                | Matches the confirmed MVP GPS scope                                                                               | Confirmed |
| Server-side analytics aggregation (no separate data warehouse)          | Sufficient for hackathon data volumes; avoids unjustified complexity                                              | Confirmed |
| Secure, classification-aware report generation                          | Required so reports can never expose more than the underlying authorized view                                     | Confirmed |
| Immutable, append-only audit logging                                    | Required for accountability and to satisfy the approved security principles                                       | Confirmed |

## 29. Final Architecture Principles

- Authorization is enforced server-side, on every request, independent of the frontend.
- Data classification governs field-level visibility even within an otherwise-authorized resource.
- Citizens and the citizen AI reach the system only through a structurally separate, public-safe path that never touches internal collections.
- The AI layer never connects directly to the database, never decides its own access scope, and never performs a binding government or contractor decision.
- Budget distribution, budget monitoring, and public budget transparency are three distinct concerns with three distinct authorization boundaries, sharing underlying data but not access paths.
- GPS/GIS functionality for the MVP is inspection/event-based; no continuous tracking exists in this architecture.
- Real-time functionality is additive; core operations do not depend on it.
- Audit logging is independent, append-only, and cannot be bypassed or edited through normal application operations.
- The modular monolith preserves clean internal boundaries so that scaling or future extraction of a module remains possible without being required now.
- This document defines how the system works; database schemas, API endpoint specifications, and frontend component implementation are deliberately deferred to the next architecture documents, which must remain consistent with everything established here and in `01-project-overview.md`.
