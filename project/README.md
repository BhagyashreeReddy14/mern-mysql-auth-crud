# MERN Auth App (with MySQL)

A full-stack authentication and dashboard application built with Node.js, Express, MySQL, React, and Tailwind CSS.

---

## Features

- JWT-based authentication (register, login, logout)
- Password reset via email (Nodemailer)
- Protected dashboard with full CRUD operations
- Item status management (active / pending / completed)
- Stats cards with live counts
- Fully responsive UI

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Node.js, Express.js, MySQL (mysql2), bcryptjs, jsonwebtoken, nodemailer |
| Frontend  | React 18 (Vite), React Router v6, Axios, Tailwind CSS, Context API |
| Database  | MySQL 8+                                        |

---

## MySQL Setup

1. Make sure MySQL is running locally.
2. Open your MySQL client and run:

```sql
source /path/to/database.sql
```

Or manually:

```sql
CREATE DATABASE IF NOT EXISTS mern_auth_db;
USE mern_auth_db;
-- then paste the contents of database.sql
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mern_auth_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

> **Gmail tip**: Use an [App Password](https://support.google.com/accounts/answer/185833) — not your regular Gmail password.

Start the backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Running Both Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint            | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | `/register`         | No   | Register new user              |
| POST   | `/login`            | No   | Login, returns JWT             |
| POST   | `/forgot-password`  | No   | Send password reset email      |
| POST   | `/reset-password`   | No   | Reset password via token       |
| GET    | `/me`               | Yes  | Get current user info          |

**Register / Login body:**
```json
{ "name": "John", "email": "john@example.com", "phone": "123", "password": "secret" }
```

**Forgot password body:**
```json
{ "email": "john@example.com" }
```

**Reset password body:**
```json
{ "token": "<reset_token>", "password": "newpassword" }
```

---

### Items — `/api/items` (all require `Authorization: Bearer <token>`)

| Method | Endpoint      | Description                        |
|--------|---------------|------------------------------------|
| GET    | `/`           | Get all items for logged-in user   |
| GET    | `/stats`      | Get total/active/pending/completed |
| GET    | `/:id`        | Get single item                    |
| POST   | `/`           | Create item                        |
| PUT    | `/:id`        | Update item                        |
| DELETE | `/:id`        | Delete item                        |

**Create / Update body:**
```json
{ "title": "My Task", "description": "Details here", "status": "active" }
```

**Stats response:**
```json
{ "success": true, "data": { "total": 5, "active": 2, "pending": 1, "completed": 2 } }
```

---

## Project Structure

```
project/
├── database.sql
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itemController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── itemRoutes.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js
    │   │   ├── authApi.js
    │   │   └── itemApi.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    └── package.json
```
