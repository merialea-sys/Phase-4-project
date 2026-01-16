# Phase-4-project
# Apex Bank

## Application Overview

Apex Bank is a full-stack banking management application designed to provide comprehensive financial services through a user-friendly interface. Built with React for the frontend and Flask for the backend, it enables users to manage personal and business banking needs, including account creation, transaction tracking, loan applications, and branch management. The system supports role-based access control, allowing regular users to handle their accounts and admins to oversee operations like loan approvals and user management. Key features include secure authentication, real-time data handling, and a responsive dashboard for easy navigation.

## API Routes

The backend exposes RESTful API endpoints for all core functionalities, secured with authentication decorators.

### Authentication Routes
- `/signup` (POST): Creates a new user account. Requires username, email, password, first_name, last_name. Returns user data on success.
- `/login` (POST): Authenticates a user. Requires username and password. Returns user data and sets session.
- `/check_session` (GET): Verifies current session. Returns user data if logged in.
- `/logout` (DELETE): Ends the user session.

### User Management
- `/users` (GET/POST): Retrieves all users or creates a new user (admin only for POST).
- `/users/<int:id>` (GET/PATCH/DELETE): Gets, updates, or deletes a specific user by ID.

### Account Management
- `/accounts` (GET/POST): Lists all accounts or creates a new account (admin required for POST).
- `/accounts/<int:id>` (GET/PATCH/DELETE): Manages individual accounts with role-based permissions (owner or admin).

### Transaction Handling
- `/transactions` (GET/POST): Fetches transactions for owned accounts or creates new transactions (owner required for POST).
- `/transactions/<int:id>` (GET/DELETE): Retrieves or deletes a specific transaction.

### Branch Operations
- `/branches` (GET/POST): Lists branches or adds a new branch.
- `/branches/<int:id>` (GET/PATCH/DELETE): Handles branch details.

### Loan Services
- `/loans` (GET/POST): Displays loans (user-specific or all for admins) or submits a loan application.
- `/loans/<int:id>` (GET/PATCH/DELETE): Manages loan records.
- `/loans/<int:id>/approve` (PATCH): Approves or rejects loans (admin only).

### User-Account Links
- `/user_accounts` (GET/POST): Manages many-to-many relationships between users and accounts.

## Data Models

### User Model
Represents bank users with authentication. Includes username, email, password hash, personal details, and admin status. Relationships: user_accounts, loans.

- `password_hash` (setter): Hashes plain password for secure storage.
- `authenticate`: Verifies plain password against hash.

### Account Model
Defines bank accounts with number, type, balance, status, and branch link. Relationships: transactions, user_accounts, branch.

### Transaction Model
Records financial transactions with amount, type, date, and account association. Relationship: account.

### Branch Model
Stores branch information like name, code, address, phone. Relationships: accounts, loans.

### Loan Model
Manages loan applications with type, amount, dates, status, and links to user and branch. Relationships: branch, user.

### UserAccount Model
Junction table for user-account roles (e.g., owner, admin). Relationships: user, account.

## Frontend Components

### App.js
Main application component setting up routing and user state. Checks session on load and renders protected routes.

- `useEffect`: Fetches session data to set user state.

### Auth.jsx
Handles login and signup forms with validation using Formik and Yup. Toggles between modes and submits to backend.

- `formik.onSubmit`: Processes form data and calls login/signup endpoints.

### ProtectedRoute.jsx
Wrapper component that redirects unauthenticated users to login.

### Navbar.jsx
Navigation bar with links to pages and auth buttons. Handles logout via API call.

- `handleLogout`: Sends DELETE to /logout and clears user state.

### Dashboard.jsx
Landing page with hero section, features, and about information. Promotes bank services.

### AccountsPage.jsx
Displays user accounts, allows creation of new accounts via form.

- `fetchAccounts`: Retrieves accounts from API.
- `formik.onSubmit`: Creates new account and updates list.

## Setup Instructions

1. Clone the repository.
2. For backend: Install Python dependencies with `pip install -r requirements.txt`, run `flask db upgrade`, seed with `python seed.py`, start with `python app.py`.
3. For frontend: Install with `npm install`, start with `npm start`.
4. Ensure CORS and environment variables are configured.

## Technologies Used

- Backend: Flask, SQLAlchemy, Flask-RESTful, Flask-CORS
- Frontend: React, React Router, Formik, Yup
- Database: SQLite (configurable)
- Authentication: Session-based with Werkzeug

## Contributing

Follow standard practices: fork, branch, commit, pull request. Ensure tests pass and code is documented.
