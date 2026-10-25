# StaffSync — Modern Human Resource Management System (MERN Stack)

StaffSync is a full-stack, enterprise-grade Human Resource Management System built using the MERN stack (**MongoDB, Express, React, Node.js**). It streamlines daily HR workflows, automated attendance tracking, leave requests, employee records management, and company-wide learning programs.

---

##  Key Features & Modules

1. **Authentication & Role-Based Access Control (RBAC)**
   - Secure JWT-based authentication with password hashing via `bcryptjs`.
   - Three distinct organizational roles: **HR Admin**, **Department Manager**, and **Staff Employee**.
   - One-click instant demo profile switchers on the login screen.

2. **Executive & Operational Dashboards**
   - **HR Admin Dashboard**: Total workforce metrics, attendance charts (Recharts), department distribution, quick actions, and recent announcements.
   - **Manager Dashboard**: Supervised team headcount, team presence today, pending leave approval queues, and staff training status.
   - **Employee Portal**: Today's shift clock status, leave balance cards, and enrolled training programs.

3. **Attendance & Timesheets**
   - Real-time **Clock-In / Clock-Out** terminal with live active shift duration stopwatch.
   - Automatic calculation of daily work hours and status tags (`Present`, `Late`, `Half-Day`).
   - Personal attendance history and company-wide roster logs with filters.

4. **Leave Management & Approval Workflows**
   - Leave quotas for `Casual`, `Sick`, `Earned`, and `Unpaid` time off.
   - Date range overlap checks and instant validation.
   - Supervisory approval queue for Managers & HR Admins with one-click approval and customized rejection feedback.

5. **Employee Directory & Administration**
   - Filterable directory by department, role, and active/inactive status.
   - Search by name, corporate email, or employee ID.
   - Add new staff profiles, update contact/manager assignments, and toggle account activation.

6. **Learning & Development (Training Catalog)**
   - Course listings with trainer details, dates, venue, and capacity progress bars.
   - Manager/HR assignment modal to enroll employees in workshops.

7. **Corporate Announcements & Notifications**
   - Company noticeboard categorized into `General`, `HR Updates`, `Events`, and `Important Notices`.
   - Real-time notification drawer with unread counter badge.

---

##  Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router v7, Axios, Lucide React, Recharts |
| **Styling** | Modern Vanilla CSS Design System with dark glassmorphism & Plus Jakarta Sans |
| **Backend** | Node.js (v24), Express 5, CORS, Dotenv, JSON Web Tokens |
| **Database** | MongoDB with Mongoose ODM (Indexes, Pre-save hooks, Aggregation pipelines) |
| **Testing** | Node native test runner (`node:test`, `node:assert`) |

---

##  Demo Credentials

All demo accounts share the default password: **`Password123!`**

| Role | Email | Name | Department / Title |
| :--- | :--- | :--- | :--- |
| **HR Admin** | `admin@staffsync.com` | Sarah Jenkins | Human Resources (VP People) |
| **Manager** | `manager.eng@staffsync.com` | Marcus Vance | Engineering Lead |
| **Manager** | `manager.mkt@staffsync.com` | Elena Rodriguez | Marketing Lead |
| **Employee** | `alice@staffsync.com` | Alice Johnson | Engineering (Senior Developer) |
| **Employee** | `bob@staffsync.com` | Bob Chen | Engineering (Frontend) |
| **Employee** | `clara@staffsync.com` | Clara Oswald | Marketing (Content) |
| **Employee** | `david@staffsync.com` | David Miller | Sales (Account Executive) |

*(Tip: You can also use the one-click demo buttons directly on the `/login` page!)*

---

##  Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/staffsync`) or a MongoDB Atlas URI.

### 2. Configure Environment Variables
- `server/.env`:
  ```ini
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
  JWT_SECRET=staffsync_super_secret_jwt_key_2025_secure_production_hash
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development
  ```
- `client/.env`:
  ```ini
  VITE_API_URL=/api
  ```

### 3. Seed Database with Realistic Data
Populate demo employees, past attendance, pending leaves, training programs, and notices:
```bash
npm run seed
```

### 4. Run the Application
In two separate terminals or background processes:

**Start Backend (Port 5000):**
```bash
npm run server
```

**Start Frontend (Port 5173):**
```bash
npm run client
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests
StaffSync includes an automated backend test suite verifying server health checks, 404 handlers, authentication validators, and security guards:
```bash
npm test
```
