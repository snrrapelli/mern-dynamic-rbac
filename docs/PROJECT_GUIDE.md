# MERN Dynamic RBAC — Project Guide

## Purpose

Build a small but professionally structured Employee Management POC that demonstrates dynamic role-based access control using the MERN stack.

This document is the single source of truth for the agreed architecture, scope, conventions, implementation order, and project progress.

## Repository

- Name: `mern-dynamic-rbac`
- Remote: `https://github.com/snrrapelli/mern-dynamic-rbac.git`
- Local root: `mern-dynamic-rbac`

## Agreed technology stack

### Frontend

- React with Vite
- JavaScript
- Material UI
- React Router
- Redux Toolkit
- Axios
- React Hook Form
- Yup

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT access and refresh tokens
- bcrypt for password hashing
- Joi for API request validation
- Helmet, CORS and rate limiting

### Development tools

- Git and GitHub
- Postman
- Nodemon
- ESLint and Prettier

### Verified local environment

- Node.js: `v22.19.0`
- npm: `10.9.3`
- Git: `2.51.0.windows.1`
- Local project path: `C:\\dev\\mern_pocs\\mern-dynamic-rbac`
- Git repository initialized with `main` as the default branch
- `origin` fetch and push remote configured as `https://github.com/snrrapelli/mern-dynamic-rbac.git`

## Core architecture decision

The application uses dynamic roles and dynamic permissions.

```text
User -> Role -> Permissions -> Module
```

- A user has one role in this POC.
- Roles are created dynamically.
- Permissions are assigned to roles dynamically.
- Users receive effective permissions through their assigned role.
- Permissions are not copied into user records.
- Routes are stored as module/page metadata.
- Authorization uses stable permission codes, not route paths.
- The backend is the final security authority.
- Access is denied by default.

Example permission codes:

```text
users.read
users.create
users.update
users.delete
roles.read
roles.create
roles.update
roles.delete
employees.read
employees.create
employees.update
employees.delete
```

Additional actions can be introduced later, such as `approve`, `reject`, `export`, `assign_role`, `activate`, and `deactivate`.

## Main collections

### Module

Stores module and navigation metadata such as name, code, route, icon, menu visibility, display order and status.

### Permission

Stores a unique permission code, module reference, action, optional frontend route/API metadata and status.

### Role

Stores a dynamic role and the permission IDs assigned to it. For this POC, permission IDs are embedded as an array in the role document.

### User

Stores user information and one `roleId`. Role permissions are resolved when required and are not duplicated in the user.

### Employee

Provides the business module used to demonstrate CRUD-level permission checks.

### RefreshToken

Stores refresh-token session information and revocation state.

### AuditLog

Records important security and data changes.

## Login and authorization flow

1. Validate the user's email and password.
2. Confirm that the user is active.
3. Load the assigned role and confirm that it is active.
4. Resolve the role's current permissions.
5. Issue a short-lived access token and a refresh token.
6. Return the user, role and permission codes to React.
7. React builds permitted routes, menus and actions.
8. Every protected backend API validates authentication and its required permission.

The access token should contain identity information such as `userId` and `roleId`, not a permanent copy of all permissions. This allows role changes to take effect without waiting for a long-lived token to expire.

## POC modules

- Authentication
- Dashboard
- Modules and permissions
- Roles
- Users
- Employees
- Audit logs

## Business rules

- Every user must have one active role.
- Permission codes and role codes must be unique.
- Inactive users cannot log in or access protected APIs.
- Users assigned to an inactive role cannot access protected APIs.
- System roles, including Super Admin, cannot be deleted.
- A user cannot delete or deactivate their own account.
- The final active Super Admin cannot be removed or demoted.
- Prefer deactivation over permanent deletion for security configuration.
- Role and permission changes must be recorded in audit logs.
- React permission checks improve the user experience but never replace backend validation.
- Missing authentication returns `401 Unauthorized`.
- Authenticated users without permission receive `403 Forbidden`.

## Repository structure

```text
mern-dynamic-rbac/
|-- client/
|-- server/
|-- docs/
|   `-- PROJECT_GUIDE.md
|-- .editorconfig
|-- .gitignore
|-- .prettierrc
|-- package.json
`-- README.md
```

## Git workflow

Long-lived branches:

```text
main
develop
```

Feature branches:

```text
feature/project-setup
feature/backend-setup
feature/database-models
feature/authentication
feature/rbac
feature/user-management
feature/employee-management
feature/frontend-setup
feature/rbac-ui
```

Flow:

```text
feature branch -> develop -> main
```

Do not commit `.env`, secrets, database credentials, access tokens or refresh tokens.

## Implementation roadmap

- [x] Finalize POC purpose and high-level scope
- [x] Finalize dynamic RBAC architecture
- [x] Choose the technology stack
- [x] Create the GitHub repository
- [x] Create and open the empty local project folder
- [x] Initialize Git and connect the remote repository
- [x] Create `feature/project-setup` branch
- [ ] Create the base monorepo structure
- [ ] Create the React client with Vite
- [ ] Create the Node/Express server
- [ ] Run frontend and backend health checks
- [ ] Make and push the initial project setup commit
- [ ] Configure MongoDB Atlas and Mongoose
- [ ] Create Module, Permission, Role and User models
- [ ] Create Employee, RefreshToken and AuditLog models
- [ ] Create seed permissions, roles and Super Admin
- [ ] Implement login, refresh, logout and current-user APIs
- [ ] Implement authentication middleware
- [ ] Implement permission authorization middleware
- [ ] Build Module and Permission APIs
- [ ] Build Role Management APIs
- [ ] Build User Management APIs
- [ ] Build Employee Management APIs
- [ ] Test backend behavior in Postman
- [ ] Configure React routing, Redux and Axios
- [ ] Build login and session restoration
- [ ] Build protected routes
- [ ] Build permission-based navigation and action controls
- [ ] Build Module and Permission screens
- [ ] Build Role Management screens and permission matrix
- [ ] Build User Management screens
- [ ] Build Employee Management screens
- [ ] Add audit logging and remaining security controls
- [ ] Test all roles and permissions end to end
- [ ] Complete README, API documentation and screenshots
- [ ] Merge `develop` into `main` and tag the POC release

## Completed step: Git and environment verification

Verified on August 6, 2026:

- The local folder is an initialized Git repository.
- The default local branch is `main`.
- The correct GitHub repository is configured for fetch and push.
- Node.js, npm and Git are installed and available from the terminal.

## Completed step: create the project setup branch

Created and verified `feature/project-setup` from `main` on August 6, 2026. All base project setup work will be completed on this feature branch before it is merged into `develop`.

## Current step: create the base monorepo structure

Add the root configuration files and create the `client`, `server`, and `docs` directories. React and Express package setup follows after this structure is verified.

## Decisions intentionally postponed

- Multiple roles per user
- User-specific permission overrides
- Multi-tenant access control
- Attribute-based access control
- Social login and SSO
- Deployment and production infrastructure
- Redis permission caching

These can be added later without changing the POC's basic permission-code approach.

## Working agreement

- Follow this roadmap in order.
- Finish and verify one step before starting the next.
- Update this guide whenever an architecture or scope decision changes.
- Use the same permission code in the database, Express authorization middleware and React permission checks.
- Keep every secret outside source control.
