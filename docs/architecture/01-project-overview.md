# InfraVision AI — Project Overview

## 1. Product Vision

InfraVision AI is a digital monitoring platform for government infrastructure projects that replaces fragmented, manual oversight with a single source of truth. It gives government officers, engineers, contractors, auditors, and citizens role-appropriate visibility into project status, budgets, milestones, and geography, while using AI to accelerate — not replace — human decision-making.

## 2. Problem Statement

Government infrastructure projects routinely suffer from:

- Poor coordination between departments, engineers, and contractors
- Manual, inconsistent progress tracking with no central record
- Limited visibility into budget allocation and actual spending
- Documentation scattered across emails, drives, and paper files
- Weak contractor accountability due to lack of measurable performance history
- Slow decision-making caused by delayed or incomplete information reaching the right people
- Little to no public transparency into how public funds are being used

These issues compound over a project's lifecycle, leading to missed deadlines, cost overruns, and erosion of public trust.

## 3. Proposed Solution

InfraVision AI provides a centralized platform to plan, track, and report on infrastructure projects across their full lifecycle. It combines structured project and budget data, geographic visualization, document management, and role-based dashboards with two AI assistants — one for citizens and one for administrators — to surface insights faster than manual review allows. The platform distinguishes clearly between AI-assisted insight and official government decisions, which always remain human-made. The end-to-end story the platform supports is: project creation → planning → contractor assignment → milestones → field progress → GPS/evidence → budget monitoring → analytics → AI insights → reports → citizen transparency.

## 4. Objectives

- Provide a single system of record for infrastructure project lifecycle data
- Make budget allocation and utilization visible to the appropriate roles, with distribution authority restricted to administrators
- Track milestones and schedule progress against approved plans
- Establish measurable contractor accountability
- Give citizens transparent, self-service access to high-level public project information
- Use AI to speed up information retrieval and flag risks, without automating government decisions
- Provide geographic context for project location and field inspection activity

## 5. Expected Outcomes

1. **Timely project completion** — through visible milestone tracking and early delay detection
2. **Improved budget utilization** — through real-time budget-vs-actual visibility and admin-controlled distribution
3. **Better project transparency** — through public dashboards and structured public data
4. **Enhanced contractor accountability** — through performance history tied to verifiable, evidence-backed data
5. **Faster decision-making** — through role-based dashboards and AI-assisted summarization

## 6. Target Users

- Government departments responsible for commissioning and overseeing infrastructure projects
- Project managers and engineers executing projects
- Field inspectors verifying on-ground progress
- Contractors delivering project work
- Auditors reviewing compliance and spending
- Citizens seeking transparency into public infrastructure spending

## 7. User Roles

The system supports seven roles. For the primary hackathon demonstration, Super Admin, Department Admin, Project Manager/Engineer, Contractor, and Citizen receive the most polished experiences; Field Engineer and Auditor remain fully supported by the authorization model but may have simpler MVP dashboards. No role is removed from the architecture.

### 7.1 Super Admin

- **Who they are:** Platform-level administrator overseeing the entire system across departments.
- **Responsibilities:** System configuration, department and user account management, platform-wide oversight.
- **Information needed:** Full visibility into all projects, departments, users, budgets, and system logs.
- **Can do:** Create/manage departments and admin accounts, configure system-wide settings, view all data, manage budget distribution, access audit logs.
- **Must NOT access:** No restriction within the platform, but all actions must be fully audit-logged given the scope of access.

### 7.2 Department Admin / Government Officer

- **Who they are:** Official within a specific government department responsible for that department's infrastructure projects.
- **Responsibilities:** Approve projects, manage and distribute budgets, assign project managers, oversee departmental performance.
- **Information needed:** All project, budget, contractor, and personnel data within their department.
- **Can do:** Create/approve projects, allocate and distribute budgets, assign staff and contractors, view departmental analytics and reports.
- **Must NOT access:** Data belonging to other departments; platform-wide system configuration.

### 7.3 Project Manager / Engineer

- **Who they are:** Individual responsible for day-to-day execution of an assigned project.
- **Responsibilities:** Maintain project plans, update milestones and timelines, coordinate contractors, review field reports.
- **Information needed:** Full detail on assigned projects — plans, read-only budget monitoring, milestones, documents, contractor data, field updates.
- **Can do:** Update project plans and milestones, upload documents, review and approve field inspection reports, communicate with contractors, view (but not distribute) budget data for assigned projects.
- **Must NOT access:** Projects not assigned to them; budget distribution/allocation authority; other departments' data.

### 7.4 Field Engineer / Inspector

- **Who they are:** On-site personnel verifying physical progress against reported progress.
- **Responsibilities:** Conduct field inspections, log GPS-tagged progress updates, flag discrepancies.
- **Information needed:** Assigned project plans, milestone definitions, prior inspection history, site locations.
- **Can do:** Submit inspection reports with GPS-tagged location and photo evidence, flag issues, update field-level milestone status.
- **Must NOT access:** Budget data or approval functions, contractor payment data, projects not assigned to them.

### 7.5 Contractor

- **Who they are:** External entity contracted to execute project work.
- **Responsibilities:** Execute assigned work, report progress, submit required documentation.
- **Information needed:** Their own assigned project scope, milestones, timelines, relevant documents, and their own basic performance indicators (e.g., milestone completion rate, schedule performance).
- **Can do:** Submit progress updates and documents for their assigned work, view their own basic performance indicators.
- **Must NOT access:** Other contractors' data, internal government budget details beyond what's contractually disclosed to them, budget distribution functions, other departments' or projects' data, internal AI assessment reasoning, confidential risk assessments, or internal audit findings.

### 7.6 Auditor

- **Who they are:** Independent, read-only reviewer verifying financial and procedural compliance, assigned to one or more authorized departments/projects.
- **Responsibilities:** Review budgets, spending records, contractor performance, and process adherence.
- **Information needed:** Read access to project information, milestones, budget information, progress, documents, and audit-relevant records/logs within their assigned scope.
- **Can do:** View detailed budget and spending records, generate audit reports, flag compliance concerns.
- **Must NOT access:** Any modification capability — auditors cannot modify project data, budgets, milestones, contractor records, or perform any administrative action.

### 7.7 Citizen

- **Who they are:** Member of the public with no platform login required for basic access.
- **Responsibilities:** None (consumer of public information); may optionally submit feedback or grievances.
- **Information needed:** Public project status, location, progress, expected completion, high-level public budget figures, public updates.
- **Can do:** Search and browse public project information, use the citizen chatbot, view the public map, submit feedback/grievances.
- **Must NOT access:** Internal documents, contractor contact/financial details, personally identifiable information of any staff or contractor, department-internal notes, audit findings, unapproved/draft data, or detailed line-item financial records.

## 8. Core Modules

### 8.1 Authentication and Authorization

- **Purpose:** Verify identity and enforce role-based access across the platform.
- **Main users:** All authenticated roles.
- **Key capabilities:** Secure login, session management, role assignment, password reset.
- **Business rules:** Citizens accessing public features do not require authentication; all other roles must be authenticated; role determines data visibility, not just feature access; the AI layer is never itself a source of authorization (see Section 15).

### 8.2 User Management

- **Purpose:** Manage accounts and role assignments for internal users.
- **Main users:** Super Admin, Department Admin.
- **Key capabilities:** Create/deactivate accounts, assign roles and departments, manage contractor onboarding.
- **Business rules:** A user has exactly one primary role at a time; role changes must be logged.

### 8.3 Project Management

- **Purpose:** Serve as the system of record for each infrastructure project.
- **Main users:** Department Admin, Project Manager.
- **Key capabilities:** Create and configure projects, define scope and department ownership, track overall lifecycle stage.
- **Business rules:** A project must belong to exactly one department; lifecycle stage changes must be recorded with a timestamp and responsible user.

### 8.4 Project Planning

- **Purpose:** Define the approved plan a project's progress will be measured against.
- **Main users:** Project Manager, Department Admin.
- **Key capabilities:** Define scope, phases, planned budget, planned timeline.
- **Business rules:** Once approved, plan changes should be versioned rather than silently overwritten, to preserve a baseline for variance analysis.

### 8.5 Milestone and Timeline Management

- **Purpose:** Track discrete, measurable checkpoints within a project's lifecycle.
- **Main users:** Project Manager, Field Engineer, Contractor.
- **Key capabilities:** Define milestones with target dates, update completion status, attach evidence.
- **Business rules:** Milestone completion should require supporting evidence (e.g., a GPS-tagged field report) rather than a self-reported status alone where feasible.

### 8.6 Budget Management (Admin-Only Distribution)

- **Purpose:** Control planned budget allocation and distribution, distinct from viewing or monitoring budget data.
- **Main users:** Super Admin, Department Admin. No other role manages or controls budget distribution.
- **Key capabilities:** Allocate and distribute budget across projects/phases/categories (admin-only); record expenditures; compute variance.
- **Business rules:** Only Super Admin and Department Admin can create, modify, or distribute budget allocations. Project Manager, Field Engineer, Contractor, and Auditor may have appropriate read-only access to budget information through Section 8.7 (Budget Monitoring), but they do not manage or control budget distribution here. This module is distinct from the public transparency figures in Section 8.7, which exposes only high-level, citizen-safe data.

### 8.7 Budget Monitoring and Public Transparency

- **Purpose:** Provide read-only budget visibility appropriate to each audience — internal roles see role-scoped monitoring detail; citizens see high-level public figures only.
- **Main users:** All internal roles (scoped detail), Citizen (high-level only).
- **Key capabilities:** Internal budget-vs-actual monitoring and distribution breakdowns; a citizen-facing public summary limited to approved budget, publicly releasable utilization, and utilization percentage (e.g., "Approved Budget: ₹50 Cr, Utilized: ₹32 Cr, Utilization: 64%").
- **Business rules:** Public budget figures must never include confidential expenditure details, internal financial records, sensitive line-item information, or private contractor financial data. The exact public fields are finalized during the database/security architecture phase.

### 8.8 Contractor Management

- **Purpose:** Maintain contractor records and their association with projects.
- **Main users:** Department Admin, Project Manager.
- **Key capabilities:** Onboard contractors, assign to projects, maintain contract scope and terms metadata.
- **Business rules:** A contractor can only view and act on projects they are explicitly assigned to.

### 8.9 Document Management

- **Purpose:** Centralize project-related documents (approvals, contracts, reports, evidence).
- **Main users:** All internal roles, scoped to their access level.
- **Key capabilities:** Upload, categorize, version, and retrieve documents; attach documents to projects/milestones.
- **Business rules:** Documents must carry an access classification (e.g., internal, restricted, public) that governs who can view them.

### 8.10 Field/GPS Tracking (Inspection-Based)

- **Purpose:** Capture location-verified, on-ground progress data tied to discrete inspection events — not continuous tracking.
- **Main users:** Field Engineer, Project Manager.
- **Key capabilities:** A Field Engineer opens an assigned project, starts an inspection/progress update, captures GPS coordinates at that moment (where device permission is granted), records progress notes, and optionally uploads photo evidence. The system stores coordinates, timestamp, project, user, and inspection details.
- **Business rules:** GPS capture is tied to an explicit inspection/progress-update event, not continuous background tracking of any user. Continuous live contractor or field-staff tracking is Future Scope (Section 18).

### 8.11 GIS/Map Visualization

- **Purpose:** Provide geographic context for projects and field inspection activity.
- **Main users:** All internal roles; a public-safe version for citizens.
- **Key capabilities:** Map-based project browsing, project location markers, inspection/evidence location markers, geographic filtering.
- **Business rules:** The public-facing map must only render approved, non-sensitive project location data — never inspection-level or contractor-identifying detail beyond what's already public.

### 8.12 Analytics

- **Purpose:** Turn raw project, budget, and milestone data into decision-relevant insight; this is a must-have MVP capability, not a stretch feature.
- **Main users:** Super Admin, Department Admin, Project Manager, Auditor.
- **Key capabilities:** Comparative project analytics, trend analysis, budget-vs-actual analysis, schedule variance calculation, contractor performance indicators, delayed-project identification, over-budget-project identification, geographic project distribution.
- **Business rules:** Analytics must be scoped to what the viewing role is authorized to see (e.g., a Department Admin sees only their department's comparative data). Implementations can remain simple for a hackathon, but the capabilities themselves are required.

### 8.13 Notifications

- **Purpose:** Alert users to time-sensitive events relevant to their role.
- **Main users:** All internal roles.
- **Key capabilities:** Milestone due/overdue alerts, budget threshold alerts, assignment notifications.
- **Business rules:** Notification content must respect the same access restrictions as the underlying data.

### 8.14 Citizen Portal

- **Purpose:** Give the public transparent, self-service access to high-level project information.
- **Main users:** Citizen.
- **Key capabilities:** Project search, map-based discovery, public status/progress/budget views, feedback submission.
- **Business rules:** No authentication required for browsing; only pre-approved public fields are ever exposed here.

### 8.15 AI Chatbot (Citizen)

- **Purpose:** Let citizens ask natural-language questions about public project information.
- **Main users:** Citizen.
- **Key capabilities:** Answer questions on project status, progress, expected completion, location, milestones, and high-level public budget figures.
- **Business rules:** The chatbot only queries a public-safe data access layer (see Section 15) — it has no path to restricted, internal, or personally identifiable data at the retrieval level, not just at the response level. It never makes or implies a government decision.

### 8.16 Admin AI Assistant

- **Purpose:** Help internal roles quickly analyze authorized project, budget, milestone, schedule, and performance data.
- **Main users:** Super Admin, Department Admin, Project Manager, Auditor.
- **Key capabilities:** Summarize project status, identify trends, risks, delays, and anomalies; answer natural-language queries over data the requesting user is authorized to see.
- **Business rules:** The assistant's data access is scoped to the requesting user's role and department via the same authorization layer as the rest of the platform. It provides decision support only — never a binding approval or action.

### 8.17 Contractor Performance Assessment (Admin-Only)

- **Purpose:** Provide an AI-assisted, data-informed view of contractor reliability and quality to support administrative decisions.
- **Main users:** Department Admin, Super Admin (admin-only).
- **Key capabilities:** Aggregate delay history, milestone completion rates, and field inspection outcomes into indicators, risks, and recommendations for admin review.
- **Business rules:** Strictly admin-only; never exposed to contractors, citizens, or the citizen chatbot. The AI must never automatically punish, blacklist, terminate, reject, or legally classify a contractor — it produces insight only, and all consequential decisions require action by authorized government personnel. Contractors may separately see their own basic performance indicators (milestone completion, schedule performance) through Section 7.5, but not the AI's internal assessment reasoning or risk scoring.

### 8.18 Reports

- **Purpose:** Generate structured, exportable summaries for internal and public use.
- **Main users:** Varies by report type (see Section 14).
- **Key capabilities:** Generate progress, budget, contractor, delay, and summary reports in document/spreadsheet form.
- **Business rules:** Report content is scoped by the requesting user's role; public-facing report variants must exclude restricted data.

### 8.19 Audit Logging

- **Purpose:** Maintain a tamper-evident record of significant actions for accountability.
- **Main users:** Auditor, Super Admin (read access); system-wide (write, automatic).
- **Key capabilities:** Log user actions (approvals, edits, budget distribution, access to sensitive data), searchable audit trail.
- **Business rules:** Audit logs are append-only and not editable by any role, including Super Admin.

## 9. Dashboard Requirements

1. **Super Admin Dashboard** — Platform-wide health: total departments, projects, users, system-wide budget summary, budget distribution controls, flagged risks across departments, recent audit activity.
2. **Department Admin Dashboard** — Department's project portfolio status, budget allocation/distribution controls, budget vs. spend, contractor performance overview, pending approvals, delayed/at-risk projects.
3. **Project Manager / Engineer Dashboard** — Assigned project statuses, milestone timelines, read-only budget monitoring for assigned projects, pending field reports, contractor updates.
4. **Field Engineer Dashboard** — Assigned inspection tasks, upcoming milestone verifications, inspection submission history, map of assigned sites.
5. **Contractor Dashboard** — Assigned project scope and milestones, submission status, own basic performance indicators, relevant documents.
6. **Auditor Dashboard** — Read-only budget vs. actual across assigned scope, compliance flags, audit trail access, exportable audit reports.
7. **Citizen Dashboard** — Searchable/map-based project browser, public status and progress summaries, high-level public budget figures, chatbot access, feedback submission.

## 10. Analytics Requirements

The following are must-have MVP capabilities (implementation can stay simple, but the capabilities are required, not optional):

- **Comparative project analytics** — Compare projects across departments, regions, or timeframes to identify outliers.
- **Trend analysis** — Show how progress, spending, or delays have evolved over time.
- **Budget vs. actual spending** — Show planned vs. real expenditure to reveal overspend or underutilization.
- **Schedule variance** — Quantify how far a project is ahead of or behind its planned timeline.
- **Contractor performance indicators** — Surface delivery reliability and quality signals per contractor for admin review.
- **Delayed project identification** — Identify projects behind schedule for prioritized attention.
- **Over-budget project identification** — Identify projects exceeding planned budget for review.
- **Geographic project distribution** — Show how projects and spending are distributed across regions.

## 11. GIS and GPS Requirements

GPS functionality is part of the MVP and is **inspection/event-based**, not continuous tracking.

- **Project locations** — Every project has an associated geographic location shown on a map.
- **GPS-tagged field inspections** — A Field Engineer opens an assigned project, starts an inspection/progress update, and the device/browser captures GPS coordinates at that moment (with permission), storing coordinates, timestamp, project, user, and inspection details.
- **Progress evidence locations** — Photo/document evidence uploaded during an inspection is tied to that inspection's location.
- **Map visualization** — Authorized users can view inspection and progress locations on the project map.
- **Geographic filtering** — Users can filter project lists and analytics by region, department jurisdiction, or map area.

Continuous live GPS tracking of contractors or field staff is explicitly **not** part of the MVP (see Section 18).

## 12. AI Capabilities

InfraVision AI includes three must-have AI capabilities, each bound by the security architecture in Section 15.

- **Citizen chatbot (public):** Answers natural-language questions using only pre-approved public project data (status, progress, expected completion, location, milestones, high-level public budget figures, public updates). It queries a dedicated public-safe data access layer and has no retrieval path to private, confidential, internal, or personally identifiable data. It never makes or implies a government decision.
- **Admin AI assistant:** Analyzes project, budget, milestone, schedule, and performance data the requesting administrator is authorized to see. It identifies trends, risks, delays, and anomalies, and provides decision support only — it does not take binding action.
- **Contractor performance assessment (admin-only):** Analyzes authorized project/contractor performance data to produce insights, indicators, risks, and recommendations for Department Admin and Super Admin review. It must never automatically punish, blacklist, terminate, reject, or legally classify a contractor — such outcomes require a decision by authorized government personnel.

**Decision boundary:** AI output across all three capabilities is always advisory. No AI component approves budgets, distributes funds, finalizes contractor ratings, or makes any legally binding government decision.

## 13. Citizen Transparency

**Visible without authentication:**

- Project name, description, and location
- Current status and progress percentage
- Expected/actual completion dates
- Public milestones
- High-level public budget figures: approved budget, publicly releasable utilization, and utilization percentage
- Public project updates/announcements
- Map-based project discovery

**Must remain private:**

- Internal documents, contracts, and correspondence
- Confidential expenditure details, internal financial records, and sensitive line-item budget information
- Contractor financial and contact details beyond what is publicly disclosed
- Personally identifiable information of any staff, officer, or contractor
- Internal notes, audit findings, and compliance flags
- Draft or unapproved project data
- Internal AI assessment reasoning and contractor risk scoring

**Additional citizen-facing capability:** A feedback/grievance submission feature allows citizens to report concerns about a specific project, routed to the relevant department for review.

## 14. Reporting

| Report                         | Purpose                                                         | Who Can Generate                                    |
| ------------------------------ | --------------------------------------------------------------- | --------------------------------------------------- |
| Project progress report        | Detailed status and milestone progress for a project            | Project Manager, Department Admin, Super Admin      |
| Budget utilization report      | Planned vs. actual spend for a project or department            | Department Admin, Auditor, Super Admin              |
| Contractor performance report  | Delivery and reliability history for a contractor               | Department Admin, Super Admin                       |
| Delayed project report         | List and detail of projects behind schedule                     | Department Admin, Project Manager, Super Admin      |
| Department summary             | Portfolio-level overview for a department                       | Department Admin, Super Admin                       |
| Citizen/public project summary | Public-safe summary of a project's status and high-level budget | Auto-generated for public access; no login required |

## 15. Security Principles

- **Least privilege:** Every role receives only the access necessary for its responsibilities.
- **Role-based access control:** All data and feature access is governed centrally by role and, where applicable, department/project assignment. Budget distribution specifically is restricted to Super Admin and Department Admin.
- **Secure authentication:** Credentials are never stored or transmitted in plaintext; sessions are managed securely.
- **Input validation:** All user-supplied input is validated before processing or storage.
- **Auditability:** Significant actions (approvals, budget distribution, data access to sensitive records, role changes) are logged immutably.
- **Protection of confidential information:** Sensitive data is classified and access-controlled at the data layer, not just the UI layer.
- **Secure document access:** Documents are served only to users authorized for their classification level.
- **Protection against unauthorized API access:** All API endpoints enforce authentication and authorization checks server-side.
- **Rate limiting:** Public endpoints and AI endpoints are rate-limited to prevent abuse.
- **Secure AI data access and layered architecture:** AI components never connect directly to the database or receive unrestricted data access. All AI data flows follow a fixed layered path:

  ```
  Database
    ↓
  Role/authorization layer
    ↓
  Data access/service layer
    ↓
  AI context/retrieval layer
    ↓
  LLM
    ↓
  Response filtering
    ↓
  User
  ```

  The citizen AI chatbot only receives data cleared through the public-safe data access layer. The admin AI assistant only receives data authorized for the specific logged-in administrator, scoped exactly as the rest of the platform scopes that user. In neither case does the AI itself decide what it is allowed to see — access is determined before the data ever reaches the AI context layer, and again filtered before the response reaches the user.

- **AI is never an authorization mechanism:** The AI must never be relied upon to enforce access control, grant permissions, or decide what a user is allowed to see. Authorization is always enforced by the role/authorization layer, independent of and prior to any AI involvement.

## 16. Non-Functional Requirements

- **Security:** Role-based access enforced consistently across UI, API, and AI layers; sensitive data classified and protected; AI access always mediated by the layered architecture in Section 15.
- **Performance:** Dashboards and map views should load promptly for typical project/dataset volumes expected in a hackathon demo scope.
- **Scalability:** Data model and module boundaries should not preclude scaling to more departments, projects, and users beyond the MVP.
- **Reliability:** Core tracking data (milestones, budgets) should not be lost or corrupted; failures in AI components should not affect core platform functionality.
- **Usability:** Each role's dashboard should surface the information that role needs without requiring navigation through irrelevant screens.
- **Accessibility:** Citizen-facing views should follow basic accessible design practices (readable contrast, keyboard navigability, alt text on visual data where feasible).
- **Maintainability:** Modules should be clearly separated so future features can be added without reworking unrelated modules.
- **Auditability:** Every consequential action (approval, budget distribution, document access to restricted material) should be traceable to a user and timestamp.

## 17. MVP Scope

### A. Must Have for MVP

**Core:**

- Authentication, role-based access control, user management
- Project management and project lifecycle management
- Milestone tracking and progress timeline
- Budget monitoring (role-scoped, read-only where applicable) and admin-only budget distribution
- Contractor management
- Document repository
- Role-based dashboards
- Audit logging

**Analytics:**

- Comparative project analytics
- Trend analysis
- Budget vs. actual spending
- Schedule variance
- Contractor performance indicators
- Delayed project identification
- Over-budget project identification
- Geographic project distribution

**GIS/GPS:**

- Project map
- GPS-tagged field inspections (event-based)
- Progress evidence locations
- Geographic filtering

**AI:**

- Citizen AI chatbot (public-safe data only)
- Admin AI assistant
- Admin-only AI-assisted contractor performance assessment

**Reporting:**

- Project progress report
- Budget utilization report
- Contractor performance report
- Delayed project report
- Department summary

**Citizen:**

- Citizen portal
- Public project search and map
- Project status, progress, milestones, expected completion
- High-level public budget information
- Public project updates
- Citizen AI chatbot

### B. Should Have if Time Permits

- Notifications and alerts
- Additional dashboards polish (Field Engineer, Auditor)
- Citizen feedback/grievance submission
- Citizen/public project summary report automation refinements

### C. Future Scope

- Continuous live contractor/field-staff GPS tracking
- Mobile application
- Drone integration
- IoT sensor integration
- Blockchain-based record-keeping
- Advanced predictive ML
- External government financial-system integrations
- Multi-language AI support
- Microservices architecture

## 18. Future Scope

See Section 17.C for the definitive list. These items are explicitly deferred because they add technical complexity disproportionate to their MVP demo value, or because they extend beyond the confirmed scope of project monitoring, transparency, budget utilization, milestone/progress tracking, contractor accountability, decision support, and citizen transparency. They should not be added merely to make the project sound more advanced.

## 19. Success Metrics

- **Project completion visibility:** Percentage of active projects with an up-to-date, verifiable status at any given time.
- **Budget variance visibility:** Percentage of projects with real-time, role-scoped budget vs. actual data available.
- **Milestone tracking accuracy:** Percentage of milestones with evidence-backed (e.g., GPS-tagged inspection) completion records vs. self-reported only.
- **Contractor accountability:** Availability of a performance history and admin-reviewed AI assessment for each active contractor.
- **Citizen information accessibility:** Percentage of active projects with a public-facing status and high-level budget summary available without login.
- **Decision-making speed:** Reduction in time for an authorized role to retrieve project status/risk information via dashboard or AI assistant, measured qualitatively for the hackathon demo against manual lookup.

## 20. Technology Direction

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

**Backend:** Node.js, Express.js, TypeScript

**Database:** MongoDB with Mongoose

**Real-time:** Socket.IO

**Maps:** Leaflet with OpenStreetMap

**Authentication:** JWT with secure password hashing

**AI:** LLM API access through a provider abstraction layer, allowing the underlying provider to be changed without reworking application logic. All AI calls pass through the layered access architecture defined in Section 15.

**Reports:** PDF and spreadsheet generation

This stack is treated as fixed direction for this project unless a specific requirement in later architecture phases surfaces a strong technical reason to deviate.

## 21. Product Constraints

- Must be buildable and demonstrable within a hackathon timeframe.
- Must clearly separate public (citizen) data from internal/restricted data at every layer, including the AI retrieval layer, not just in the UI.
- Budget distribution authority is restricted to Super Admin and Department Admin; all other roles are read-only on budget data.
- AI components must never be the final authority on any government decision, budget distribution, or contractor rating/status change.
- GPS functionality for MVP is inspection/event-based only; continuous live tracking is out of scope.
- The MVP must remain realistic in scope; breadth must not come at the cost of a working, demonstrable core flow (project creation → planning → contractor assignment → milestones → field progress → GPS/evidence → budget monitoring → analytics → AI insights → reports → citizen transparency).
- The system must support all seven defined roles in the authorization model, even where dashboard polish is deferred for some roles.

## 22. Key Business Rules

- A project belongs to exactly one department and has one lifecycle status at a time.
- Budget distribution/allocation is restricted to Super Admin and Department Admin; Project Manager, Field Engineer, Contractor, Auditor, and Citizen have no budget-modification permission.
- Milestone completion should be evidence-backed (e.g., GPS-tagged inspection) where feasible, not purely self-reported.
- Contractors can only access data for projects they are explicitly assigned to, and may view only their own basic performance indicators — not internal AI assessment reasoning.
- Auditors have read-only access across their assigned departments/projects; they cannot modify project, budget, contractor, or milestone data, or perform any administrative action.
- The citizen chatbot's data access is restricted at the retrieval layer to the public-safe data access layer only.
- Admin-only contractor performance assessment output is visible only to Department Admin and Super Admin, and never automatically triggers punitive or legal action against a contractor.
- GPS capture is tied to explicit inspection/progress-update events, not continuous tracking.
- All documents carry an access classification that determines role-based visibility.
- Audit logs are immutable and cannot be edited or deleted by any role.
- The AI layer is never used as, or treated as, an authorization mechanism.

## 23. Architecture Decisions Requiring Confirmation

The following decisions are confirmed and now govern the remainder of the architecture:

1. **Public budget granularity:** Citizens see high-level approved budget, public utilization amount/percentage, and public budget status. Sensitive line-item financial information remains private.
2. **Evidence requirements:** For MVP, milestone/progress completion should use evidence where feasible. Field inspections capture timestamp and GPS coordinates and may include photo/document evidence.
3. **Contractor performance visibility:** Contractors may see basic performance indicators for their own assigned projects. Detailed AI assessment and internal risk analysis remain admin-only.
4. **Citizen chatbot data:** The citizen AI retrieves only explicitly public-safe data through an authorized public data access/service layer, and must never directly access unrestricted internal collections.
5. **Auditor scope:** Auditors are read-only and can be assigned to one or more authorized departments/projects.
6. **MVP roles:** Primary demonstrated dashboards are Super Admin, Department Admin, Project Manager/Engineer, Contractor, and Citizen. Field Engineer and Auditor remain supported roles with simpler MVP interfaces if necessary.
