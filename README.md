# MERN Dynamic RBAC

A proof-of-concept application demonstrating dynamic Role-Based Access Control using the MERN stack.

## Technology Stack

### Frontend

- React with Vite
- Material UI
- React Router
- Redux Toolkit
- Axios
- React Hook Form
- Yup

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

## Core RBAC Flow

```text
User -> Role -> Permissions -> Module Actions
```

- Roles are created dynamically.
- Permissions are assigned to roles.
- Each user is assigned one role.
- Permissions control API access, routes, menus, and buttons.
- Backend authorization uses permission codes such as `users.read` and `users.create`.

## Project Structure

```text
mern-dynamic-rbac/
├── client/
├── server/
├── docs/
│   └── PROJECT_GUIDE.md
├── .editorconfig
├── .gitignore
├── .prettierrc
├── package.json
└── README.md
```

## Current Status

Project setup is in progress.

Detailed requirements and implementation progress are maintained in:

```text
docs/PROJECT_GUIDE.md
```