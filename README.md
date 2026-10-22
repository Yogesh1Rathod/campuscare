# CampusCare: Smart Campus Complaint Management System

A web application where students report campus problems (Wi-Fi, labs, classrooms, water, electricity, cleaning, etc.), staff resolve them, and administrators monitor everything. This file explains **what the project is, how it works and why it was built this way.

---

## 1. Problem Statement
Complaints about campus facilities are usually made verbally. They get forgotten, nobody knows who is responsible, the student never hears back, and the administration has no data on how long problems take to fix.

## 2. Solution
CampusCare moves the whole process online:
- Students submit a complaint and track its progress step by step.
- Admins assign it to a department and a staff member.
- Staff update the status and add resolution notes.
- Everyone involved is notified of changes.
- After resolution, the student rates the work.
- Admins see charts and reports built from real data.

## 3. Technology Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 19 + Vite | Fast, component-based UI |
| Styling | Tailwind CSS | Consistent design system, responsive layout |
| Routing | React Router | Separate pages per role, protected routes |
| Forms | React Hook Form + Zod | Validation on every form |
| Charts | Recharts | Dashboard analytics |
| Icons / Toasts | Lucide React / Sonner | Icons and success/error messages |
| Backend | Node.js + Express | REST API |
| Database | MongoDB Atlas + Mongoose | Flexible documents, cloud hosted |
| Auth | JWT in HTTP-only cookie + bcryptjs | Secure login, hashed passwords |
| Images | Cloudinary (optional) | Vercel cannot store files permanently |
| Hosting | Vercel (frontend and backend) | Free, simple deployment |

## 4. User Roles

| Role | What they can do |
| --- | --- |
| **Student** | Register, submit complaints (with optional image), track status and timeline, cancel or reopen, rate resolved complaints, get notifications, edit profile |
| **Staff** | See only complaints assigned to them, update status with comments, add resolution notes, view stats and history |
| **Admin** | See all complaints and statistics, assign to department/staff, set priority, manage users, departments, categories and SLA, view reports, review feedback, disable accounts |

Important points:
- Anyone who registers publicly becomes a **student**. There is no public admin or staff registration.
- Staff accounts are created by the admin. The first admin is created with a local seed script.
- The role is **never trusted from the frontend**. The backend checks it on every protected request.

## 5. Complaint Lifecycle

```
Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed
                  |                                        |
               Rejected (reason)                    Reopened (reason)
```
- Only valid transitions are allowed, and the backend enforces this. For example, a student cannot mark their own complaint as resolved.
- Rejecting, resolving or reopening **requires a comment**.
- Every change is saved in the complaint **history** (who, old status, new status, comment, time) and creates a **notification** for the relevant user.

## 6. Special Features

1. **Smart priority suggestion.** A transparent rule-based system scores the category and keywords in the description (for example "power failure", "flood", "short circuit") and suggests Low, Medium, High or Critical. The reasons are shown. It is not AI. Admins can override the priority.
2. **Duplicate complaint warning.** Before submitting, the system checks for recent open complaints in the same category and location and warns the student. Complaints are never merged automatically.
3. **SLA tracking.** Each priority has a target resolution time (admin configurable). The system shows time remaining, at risk, overdue, and the percentage resolved within target.
4. **Timeline.** Every complaint shows a clear step-by-step history.
5. **Feedback.** A 1 to 5 rating and a comment after resolution. One rating per resolution cycle.
6. **Search, filter, pagination.** Done on the server, by status, category, priority, department, date and staff.
7. **Analytics.** Complaints by status, category and month, average resolution time, overdue count, department performance. All numbers are calculated from real database records.
8. **Complaint numbers.** Format `CC-2026-0001`, generated with an atomic counter so duplicates cannot happen.

## 7. System Architecture

```
Browser (React app on Vercel)
        |  HTTPS + cookie
        v
Express API (Vercel serverless, /api/...)
   middleware: CORS -> CSRF guard -> auth -> role check -> validation
        |
        v
MongoDB Atlas      Cloudinary (images)
```

Request flow example (student submits a complaint):
1. The form is validated in the browser with Zod.
2. `POST /api/complaints` is sent with the login cookie.
3. The backend checks the login, validates the data again, suggests the priority, calculates the target time and creates the complaint number.
4. The complaint and its first history entry are saved, and admins are notified.
5. The frontend shows a success toast and opens the complaint page.

## 8. Folder Structure

```
campuscare/
├── backend/
│   ├── api/index.js          # Vercel entry point
│   ├── src/
│   │   ├── models/           # User, Complaint, ComplaintHistory, Department,
│   │   │                     # Category, Notification, Feedback, Counter, Setting
│   │   ├── controllers/      # Request handling (auth, complaint, admin, ...)
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # auth, security, validation, upload, errors
│   │   ├── services/         # complaint logic, analytics
│   │   ├── utils/            # workflow, priority rules, SLA
│   │   ├── validators/       # Zod schemas
│   │   └── scripts/          # seedAdmin, seedDemo
│   └── tests/                # unit and API tests
└── frontend/
    ├── public/               # favicon, logo
    └── src/
        ├── pages/            # Landing, Login, student/, staff/, admin/
        ├── components/       # reusable UI (StatusBadge, Timeline, FilterBar, ...)
        ├── context/          # AuthContext, MetaContext
        ├── hooks/ lib/       # data fetching, API client, helpers
        └── App.jsx           # routes and role protection
```

## 9. Database Models

| Model | Purpose |
| --- | --- |
| User | name, email, password hash, role, department, active flag |
| Complaint | number, title, description, category, location, image, priority, status, assignee, target time, notes |
| ComplaintHistory | one record for each action or status change |
| Notification | message for a user, with read/unread state |
| Feedback | rating and comment for a resolved complaint |
| Department / Category | managed by the admin |
| Counter | generates unique complaint numbers |
| Setting | SLA hours for each priority |

## 10. Security Measures
- Passwords hashed with **bcryptjs**. Hashes are never sent to the client.
- Login token stored in an **HTTP-only, Secure cookie**, so JavaScript cannot read it.
- **Role and ownership checks on the backend**: a student can see only their own complaints and staff only their assigned ones.
- The user is loaded from the database on every request, so a disabled account loses access immediately.
- **CSRF protection** with a required custom header and origin check.
- **CORS** limited to the real frontend URL.
- **Rate limiting** on login and register.
- Input validation (Zod), input sanitisation, **image type checked by file signature** and size limit.
- Secrets are in environment variables only and never in GitHub.

## 11. Main API Endpoints

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/me` |
| Complaints | `POST/GET /api/complaints`, `GET /api/complaints/:id`, `PATCH .../status`, `.../assign`, `POST .../comments`, `.../reopen`, `.../feedback` |
| Notifications | `GET /api/notifications`, `PATCH .../:id/read`, `PATCH .../read-all` |
| Admin | `/api/admin/dashboard`, `/users`, `/departments`, `/categories`, `/reports`, `/sla-settings`, `/feedback` |

## 12. Live Demo Script (5 minutes)
1. **Landing page.** Show the problem and the features.
2. **Register** a new student and log in.
3. **Submit a complaint** (for example "Lab 3 power failure"). Show the suggested priority and its reasons. Submit the same one again to show the duplicate warning.
4. **Log in as admin.** Open the complaint, assign it to a department and a staff member, and set the priority.
5. **Log in as staff.** Open the assigned complaint and move it to In Progress, then Resolved with a note.
6. **Back as student.** Show the notifications and the timeline, then give a rating.
7. **Admin dashboard and reports.** Show the charts, overdue complaints and SLA percentage.
8. Show one **security point**: try opening another user's complaint link and get a denied response.

## 14. Limitations and Future Scope
- Notifications are in-app only. Email or SMS can be added.
- Rate limiting is per server instance. A shared store (such as Redis) would make it stricter.
- Image upload needs Cloudinary credentials. Without them, complaints work without images.
- Possible additions: email alerts, mobile app, comment threads, CSV export of reports.
