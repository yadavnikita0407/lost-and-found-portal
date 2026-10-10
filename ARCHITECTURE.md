# Architecture — College Lost & Found Portal

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Full Directory Structure](#3-full-directory-structure)
4. [Module Breakdown](#4-module-breakdown)
   - [Backend Modules](#41-backend-modules)
   - [Frontend Modules](#42-frontend-modules)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Image Handling](#8-image-handling)
9. [Matching Engine](#9-matching-engine)
10. [Notification System](#10-notification-system)
11. [Security Measures](#11-security-measures)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│              (Vite + Tailwind CSS)                  │
│  Pages → Components → Hooks → Axios API Client      │
└───────────────────┬─────────────────────────────────┘
                    │  HTTPS / REST API
                    ▼
┌─────────────────────────────────────────────────────┐
│               Express.js Backend                    │
│   Routes → Middleware → Controllers → Services      │
│   JWT Auth   Role Guards   Input Validation         │
└───────┬───────────────────────────┬─────────────────┘
        │                           │
        ▼                           ▼
┌───────────────┐         ┌──────────────────┐
│  MongoDB Atlas│         │    Cloudinary    │
│  (Mongoose)   │         │  (Image Storage) │
└───────────────┘         └──────────────────┘
```

**Data flow:**
1. The React client renders pages and sends HTTP requests to the Express REST API.
2. Express middleware validates tokens, enforces roles, and sanitizes input.
3. Controllers call service functions; services interact with MongoDB via Mongoose models.
4. Image uploads go through Multer, then are forwarded to Cloudinary; the returned URL is stored in MongoDB.
5. Structured JSON responses are returned to the client.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React.js 18 (Vite) | UI rendering and routing |
| Styling | Tailwind CSS | Utility-first responsive styling |
| HTTP client | Axios | REST API calls with interceptors |
| Client routing | React Router v6 | SPA page navigation |
| State management | React Context + useReducer | Auth state, notifications |
| Backend framework | Node.js + Express.js | REST API server |
| Database | MongoDB (Atlas) | Document store |
| ODM | Mongoose | Schema definition and queries |
| Authentication | JWT (jsonwebtoken) | Stateless token auth |
| Password hashing | bcryptjs | Secure credential storage |
| File uploads | Multer | Multipart form parsing |
| Cloud images | Cloudinary | Production image storage |
| Validation | express-validator | Request input validation |
| Security headers | Helmet | HTTP security headers |
| Rate limiting | express-rate-limit | Abuse prevention |
| CORS | cors | Cross-origin request control |
| Env management | dotenv | Environment variable loading |
| Dev server | nodemon | Hot reload in development |
| Version control | Git + GitHub | Source control and collaboration |
| Frontend hosting | Vercel / Netlify | Static + SSR deployment |
| Backend hosting | Render | Node.js server hosting |

---

## 3. Full Directory Structure

```
lost-and-found-portal/
│
├── client/                              # React frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                         # Axios instance and API call modules
│   │   │   ├── axiosInstance.js         # Base Axios config, interceptors
│   │   │   ├── authApi.js               # /auth endpoints
│   │   │   ├── itemsApi.js              # /items endpoints
│   │   │   ├── claimsApi.js             # /claims endpoints
│   │   │   ├── notificationsApi.js      # /notifications endpoints
│   │   │   ├── matchesApi.js            # /matches endpoints
│   │   │   └── adminApi.js              # /admin endpoints
│   │   │
│   │   ├── assets/                      # Static images, icons, fonts
│   │   │
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── ProtectedRoute.jsx   # Auth guard component
│   │   │   │
│   │   │   ├── items/
│   │   │   │   ├── ItemCard.jsx         # Card for a single item listing
│   │   │   │   ├── ItemGrid.jsx         # Grid of ItemCards
│   │   │   │   ├── ItemForm.jsx         # Shared form for lost/found reporting
│   │   │   │   ├── ItemFilters.jsx      # Filter panel (category, status, date)
│   │   │   │   └── MatchSuggestion.jsx  # Suggested match card
│   │   │   │
│   │   │   ├── claims/
│   │   │   │   ├── ClaimForm.jsx
│   │   │   │   └── ClaimStatusBadge.jsx
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationList.jsx
│   │   │   │   └── NotificationItem.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── StatCard.jsx         # Dashboard stat tile
│   │   │       ├── ReportTable.jsx      # Tabular report list for admin
│   │   │       ├── ClaimTable.jsx
│   │   │       └── UserTable.jsx
│   │   │
│   │   ├── context/                     # React Context providers
│   │   │   ├── AuthContext.jsx          # Current user, login/logout
│   │   │   └── NotificationContext.jsx  # Unread count, fetch trigger
│   │   │
│   │   ├── hooks/                       # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useItems.js
│   │   │   ├── useClaims.js
│   │   │   └── useNotifications.js
│   │   │
│   │   ├── pages/                       # Route-level page components
│   │   │   ├── Home.jsx                 # Landing / hero page
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx            # Student / staff dashboard
│   │   │   ├── ReportLost.jsx
│   │   │   ├── ReportFound.jsx
│   │   │   ├── SearchItems.jsx          # Browse + filter all reports
│   │   │   ├── ItemDetails.jsx          # Single item detail view
│   │   │   ├── MyReports.jsx
│   │   │   ├── MyClaims.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── NotFound.jsx             # 404 page
│   │   │   └── admin/
│   │   │       ├── AdminLogin.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminReports.jsx
│   │   │       ├── AdminClaims.jsx
│   │   │       └── AdminUsers.jsx
│   │   │
│   │   ├── utils/                       # Client-side helpers
│   │   │   ├── formatDate.js
│   │   │   ├── constants.js             # Category list, status enums
│   │   │   └── validators.js            # Client-side form validators
│   │   │
│   │   ├── App.jsx                      # Root component + route definitions
│   │   ├── main.jsx                     # Vite entry point
│   │   └── index.css                    # Tailwind directives
│   │
│   ├── .env                             # VITE_API_URL (gitignored)
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                              # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # Mongoose connection
│   │   │   └── cloudinary.js            # Cloudinary SDK config
│   │   │
│   │   ├── models/                      # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── CollegeMember.js
│   │   │   ├── Item.js
│   │   │   ├── Claim.js
│   │   │   ├── Notification.js
│   │   │   ├── Match.js
│   │   │   └── AuditLog.js
│   │   │
│   │   ├── routes/                      # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── itemRoutes.js
│   │   │   ├── claimRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── matchRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── controllers/                 # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── itemController.js
│   │   │   ├── claimController.js
│   │   │   ├── notificationController.js
│   │   │   ├── matchController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── services/                    # Business logic layer
│   │   │   ├── authService.js           # Registration eligibility, token issue
│   │   │   ├── itemService.js           # CRUD, search, filter, pagination
│   │   │   ├── claimService.js          # Claim creation and status updates
│   │   │   ├── matchService.js          # Match scoring and suggestion logic
│   │   │   ├── notificationService.js   # Create and dispatch notifications
│   │   │   └── uploadService.js         # Multer + Cloudinary pipeline
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js        # JWT verification
│   │   │   ├── roleMiddleware.js        # Role-based access guard
│   │   │   ├── uploadMiddleware.js      # Multer config (type/size limits)
│   │   │   ├── validationMiddleware.js  # express-validator rule runner
│   │   │   └── errorMiddleware.js       # Centralized error handler
│   │   │
│   │   ├── validators/                  # express-validator rule sets
│   │   │   ├── authValidators.js
│   │   │   ├── itemValidators.js
│   │   │   └── claimValidators.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js         # JWT signing helper
│   │   │   ├── auditLogger.js           # AuditLog write helper
│   │   │   └── constants.js             # Shared enums (roles, statuses)
│   │   │
│   │   └── app.js                       # Express app setup (middleware, routes)
│   │
│   ├── server.js                        # Entry point — starts HTTP server
│   ├── .env                             # Secrets (gitignored)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

---

## 4. Module Breakdown

### 4.1 Backend Modules

#### `config/`

| File | Responsibility |
|---|---|
| `db.js` | Connects Mongoose to MongoDB Atlas using `MONGO_URI`; exits process on failure |
| `cloudinary.js` | Configures the Cloudinary SDK with credentials from environment variables |

---

#### `models/`

Each file exports a Mongoose schema + model.

| Model | Key Fields |
|---|---|
| `User` | `name`, `prn`, `email`, `mobile`, `passwordHash`, `role` (student/staff/admin), `status` (active/suspended), `createdAt` |
| `CollegeMember` | `prn`, `name`, `email`, `memberType`, `year`, `isActive` — the authorized member list |
| `Item` | `reporterId` (ref User), `type` (lost/found), `name`, `category`, `description`, `location`, `dateReported`, `colour`, `brand`, `uniqueDetails`, `photoUrl`, `status` (pending/active/returned/rejected) |
| `Claim` | `itemId` (ref Item), `claimantId` (ref User), `reason`, `status` (pending/approved/rejected), `reviewerId`, `reviewedAt` |
| `Notification` | `recipientId` (ref User), `type`, `message`, `isRead`, `createdAt` |
| `Match` | `lostItemId`, `foundItemId`, `score`, `status` (suggested/confirmed/dismissed), `createdAt` |
| `AuditLog` | `actorId` (ref User), `actionType`, `targetId`, `timestamp` |

---

#### `routes/`

Route files map HTTP verbs and paths to controller functions. All routes except auth are protected by `authMiddleware`.

| Router file | Prefix | Key routes |
|---|---|---|
| `authRoutes.js` | `/api/auth` | `POST /register`, `POST /login`, `GET /me` |
| `itemRoutes.js` | `/api/items` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `claimRoutes.js` | `/api/claims` | `POST /`, `GET /my`, `GET /:id` |
| `matchRoutes.js` | `/api/matches` | `GET /item/:id` |
| `notificationRoutes.js` | `/api/notifications` | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |
| `adminRoutes.js` | `/api/admin` | `/reports`, `/claims`, `/users`, `/stats`, `/logs` |

---

#### `controllers/`

Controllers handle HTTP request/response. They call service functions and return structured JSON.

**`authController.js`**
- `register` — validates input, checks `CollegeMember`, hashes password, creates `User`, returns JWT
- `login` — verifies credentials, issues JWT
- `getMe` — returns authenticated user profile

**`itemController.js`**
- `createItem` — saves report, triggers match scan via `matchService`
- `getItems` — paginated search with keyword + filters
- `getItemById` — returns item; masks sensitive fields for non-owners
- `updateItem` — owner or admin only
- `deleteItem` — admin or owner (pending status only)

**`claimController.js`**
- `createClaim` — validates user isn't the reporter, saves claim, notifies admin
- `getMyClaims` — returns claims by the authenticated user
- `getClaimById` — accessible to claimant, item reporter, and admin

**`matchController.js`**
- `getMatchesForItem` — returns scored match suggestions for a given item ID

**`notificationController.js`**
- `getNotifications` — returns all notifications for the current user
- `markAsRead` / `markAllAsRead` — updates read status

**`adminController.js`**
- `getStats` — aggregates dashboard metrics
- `getReports` / `updateReport` — list and moderate item reports
- `getClaims` / `updateClaim` — review and approve/reject claims
- `getUsers` / `updateUserStatus` — suspend or reactivate accounts
- `getLogs` — paginated audit log

---

#### `services/`

Services contain business logic, keeping controllers thin.

**`authService.js`**
- `checkEligibility(prn, email)` — queries `CollegeMember` to verify registration eligibility
- `issueToken(userId, role)` — signs and returns a JWT

**`itemService.js`**
- `searchItems({ keyword, category, type, location, dateFrom, dateTo, status, page, limit })` — builds a MongoDB query with regex and date range filters; returns paginated results

**`matchService.js`**
- `generateMatches(newItem)` — runs after a new item is saved
- Scoring logic: compares `category` (exact), `name` (text similarity), `colour`, `brand`, `location`, `date proximity`
- Matches above a threshold score are saved as `Match` documents
- Notifications are dispatched to relevant reporters

**`notificationService.js`**
- `createNotification({ recipientId, type, message })` — writes a `Notification` document
- Called by other services when events occur (claim approved, match found, item returned)

**`uploadService.js`**
- Wraps Multer for local disk buffering
- Uploads buffer to Cloudinary, returns the secure URL

---

#### `middleware/`

| File | What it does |
|---|---|
| `authMiddleware.js` | Extracts Bearer token, verifies JWT, attaches `req.user` |
| `roleMiddleware.js` | `requireRole(...roles)` — returns 403 if `req.user.role` is not allowed |
| `uploadMiddleware.js` | Multer `memoryStorage` config; restricts to JPEG/PNG/WebP, max 5 MB |
| `validationMiddleware.js` | Runs `validationResult(req)`; returns 422 with error array if invalid |
| `errorMiddleware.js` | Catches all errors; returns structured `{ success: false, message }` JSON |

---

#### `validators/`

express-validator chains, imported by route files.

| File | Rules |
|---|---|
| `authValidators.js` | Email format, PRN pattern, password length, name required |
| `itemValidators.js` | Name, category, location, date required; description length limit |
| `claimValidators.js` | Reason required, minimum length |

---

### 4.2 Frontend Modules

#### `api/`

All API calls are made through typed functions in this layer — no raw Axios calls inside components.

| File | Exports |
|---|---|
| `axiosInstance.js` | Configured Axios instance; request interceptor attaches JWT from localStorage; response interceptor redirects on 401 |
| `authApi.js` | `register()`, `login()`, `getMe()` |
| `itemsApi.js` | `fetchItems(params)`, `fetchItemById(id)`, `createItem(data)`, `updateItem(id, data)`, `deleteItem(id)` |
| `claimsApi.js` | `submitClaim(data)`, `getMyClaims()` |
| `matchesApi.js` | `getMatchesForItem(itemId)` |
| `notificationsApi.js` | `getNotifications()`, `markRead(id)`, `markAllRead()` |
| `adminApi.js` | `getStats()`, `getAdminReports()`, `updateReport()`, `getAdminClaims()`, `updateClaim()`, `getUsers()`, `updateUser()`, `getLogs()` |

---

#### `context/`

| Context | State | Actions |
|---|---|---|
| `AuthContext` | `user`, `token`, `isLoading` | `login(credentials)`, `logout()`, `refreshUser()` |
| `NotificationContext` | `unreadCount`, `notifications` | `fetchNotifications()`, `markRead(id)` |

---

#### `hooks/`

Thin wrappers around `api/` functions with loading and error state management via `useState`/`useEffect`.

| Hook | Returns |
|---|---|
| `useAuth()` | Accesses `AuthContext` |
| `useItems(params)` | `{ items, loading, error, totalPages }` |
| `useClaims()` | `{ claims, loading, error, submitClaim }` |
| `useNotifications()` | Accesses `NotificationContext` |

---

#### `pages/`

| Page | Route | Access |
|---|---|---|
| `Home` | `/` | Public |
| `Register` | `/register` | Public |
| `Login` | `/login` | Public |
| `Dashboard` | `/dashboard` | Student, Staff |
| `ReportLost` | `/report/lost` | Student, Staff |
| `ReportFound` | `/report/found` | Student, Staff |
| `SearchItems` | `/items` | Student, Staff |
| `ItemDetails` | `/items/:id` | Student, Staff |
| `MyReports` | `/my-reports` | Student, Staff |
| `MyClaims` | `/my-claims` | Student, Staff |
| `Notifications` | `/notifications` | Student, Staff |
| `AdminLogin` | `/admin/login` | Public |
| `AdminDashboard` | `/admin/dashboard` | Admin |
| `AdminReports` | `/admin/reports` | Admin |
| `AdminClaims` | `/admin/claims` | Admin |
| `AdminUsers` | `/admin/users` | Admin |

`ProtectedRoute` wraps all authenticated pages and redirects unauthenticated users to `/login`. Admin pages additionally check for the admin role.

---

#### `components/`

**`common/`** — layout and utility components used across pages
- `Navbar` — navigation links, notification bell with unread count, user menu
- `Sidebar` — admin navigation
- `Loader` — full-page and inline spinner
- `Modal` — reusable overlay for confirmations and claim forms
- `Pagination` — page number controls, receives `page` and `totalPages`
- `ProtectedRoute` — renders children only when authenticated; role-aware

**`items/`** — item-specific UI
- `ItemCard` — displays photo thumbnail, name, category, location, status badge, date
- `ItemGrid` — renders a responsive grid of `ItemCard` components
- `ItemForm` — shared controlled form for both lost and found reports; includes image upload preview
- `ItemFilters` — filter sidebar/panel with dropdowns for category, type, location, status, and date picker
- `MatchSuggestion` — compact card showing a potential match with a link to the matched item

**`claims/`**
- `ClaimForm` — textarea for claim reason; submitted via `useClaims` hook
- `ClaimStatusBadge` — colour-coded badge (pending / approved / rejected)

**`notifications/`**
- `NotificationList` — scrollable list of `NotificationItem` components
- `NotificationItem` — single row with icon, message, timestamp, and read/unread styling

**`admin/`**
- `StatCard` — metric tile with label, count, and optional icon
- `ReportTable` — sortable table of item reports with approve/reject/edit actions
- `ClaimTable` — table of pending and resolved claims with reviewer controls
- `UserTable` — user list with suspend/reactivate toggle

---

## 5. Database Schema

### Indexes

| Collection | Index |
|---|---|
| `items` | `{ type, category, status }` compound; `{ name: 'text', description: 'text', brand: 'text' }` text index |
| `items` | `{ location: 1, dateReported: -1 }` |
| `claims` | `{ itemId: 1, claimantId: 1 }` unique compound |
| `notifications` | `{ recipientId: 1, isRead: 1, createdAt: -1 }` |
| `matches` | `{ lostItemId: 1, foundItemId: 1 }` |
| `users` | `{ email: 1 }` unique; `{ prn: 1 }` unique |

---

## 6. API Design

All endpoints return:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

Paginated endpoints return:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "totalPages": 5, "totalItems": 48 }
}
```

### Auth

| Method | Path | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | name, prn, email, mobile, password | None |
| POST | `/api/auth/login` | email, password | None |
| GET | `/api/auth/me` | — | JWT |

### Items

| Method | Path | Notes |
|---|---|---|
| GET | `/api/items` | Query params: `type`, `category`, `location`, `keyword`, `status`, `dateFrom`, `dateTo`, `page`, `limit` |
| POST | `/api/items` | Multipart form (includes image) |
| GET | `/api/items/:id` | Sensitive fields masked for non-owners |
| PUT | `/api/items/:id` | Owner or admin |
| DELETE | `/api/items/:id` | Admin or owner (pending status only) |

### Claims

| Method | Path | Notes |
|---|---|---|
| POST | `/api/claims` | Body: `itemId`, `reason` |
| GET | `/api/claims/my` | Returns current user's claims |
| GET | `/api/claims/:id` | Claimant, item reporter, or admin |

### Matches

| Method | Path | Notes |
|---|---|---|
| GET | `/api/matches/item/:id` | Returns match suggestions for an item |

### Notifications

| Method | Path |
|---|---|
| GET | `/api/notifications` |
| PATCH | `/api/notifications/:id/read` |
| PATCH | `/api/notifications/read-all` |

### Admin

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard metrics |
| GET | `/api/admin/reports` | All item reports, paginated |
| PATCH | `/api/admin/reports/:id` | Approve / reject / edit |
| GET | `/api/admin/claims` | All claims |
| PATCH | `/api/admin/claims/:id` | Approve / reject, trigger notification and mark item returned |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id` | Suspend / reactivate |
| GET | `/api/admin/logs` | Audit log, paginated |
| GET | `/api/admin/search-stats` | Aggregated search keyword stats |

---

## 7. Authentication & Authorization

### Login Flow

```
POST /api/auth/login
  → Validate input
  → Find User by email
  → bcrypt.compare(password, user.passwordHash)
  → Sign JWT { userId, role, exp }
  → Return token
```

### Request Authentication

```
Request arrives
  → authMiddleware extracts Authorization: Bearer <token>
  → jwt.verify(token, JWT_SECRET)
  → Attaches { userId, role } to req.user
  → Next()
```

### Role Enforcement

```js
// Route definition example
router.patch(
  '/admin/claims/:id',
  authMiddleware,
  roleMiddleware('admin'),
  adminController.updateClaim
)
```

JWT payload contains `role`. Roles: `student` | `staff` | `admin`.

---

## 8. Image Handling

```
User submits form with image
  → Multer memoryStorage buffers the file
  → uploadMiddleware validates: MIME type (JPEG/PNG/WebP), max size 5 MB
  → uploadService streams buffer to Cloudinary
  → Cloudinary returns { secure_url, public_id }
  → secure_url stored in Item.photoUrl
  → public_id stored for future deletion
```

In development, images can be stored to `server/uploads/` using Multer's `diskStorage` by setting `STORAGE=local` in `.env`.

---

## 9. Matching Engine

`matchService.generateMatches(newItem)` runs whenever a new item report is saved.

**Score calculation** (max 100):

| Criterion | Weight |
|---|---|
| Category exact match | 30 |
| Name token overlap | 25 |
| Colour match | 15 |
| Brand match | 15 |
| Location match | 10 |
| Date proximity (±7 days) | 5 |

Pairs scoring ≥ 50 are saved as `Match` documents with status `suggested`. The reporters of both items receive a notification. Admins can confirm or dismiss suggested matches.

---

## 10. Notification System

Notifications are written directly to the `Notification` collection by `notificationService.createNotification()`. They are pulled by the frontend on page load and when the notification bell is tapped.

| Trigger event | Recipient |
|---|---|
| Report submitted (pending review) | Reporter |
| Report approved / rejected | Reporter |
| Match suggested | Both reporters |
| Claim submitted | Admin (in-app log) |
| Claim approved / rejected | Claimant |
| Item marked as returned | Reporter + Claimant |

Future enhancement: email notifications via Nodemailer or SendGrid.

---

## 11. Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | `bcryptjs` with salt rounds ≥ 10 |
| Token auth | JWT; short expiry (`7d`); stored in `localStorage` |
| Role guards | Backend middleware on every protected route |
| Input validation | `express-validator` on all mutation endpoints |
| Injection prevention | Mongoose parameterized queries; `$` operator sanitization |
| File upload safety | MIME type whitelist + 5 MB size cap via Multer |
| Security headers | `helmet()` applied globally |
| Rate limiting | `express-rate-limit` on `/api/auth` routes (e.g., 10 req / 15 min) |
| CORS | Restricted to `CLIENT_ORIGIN` environment variable |
| Secret management | All credentials in `.env`; `.env` in `.gitignore` |
| Audit trail | Security and admin events logged to `AuditLog` without passwords or tokens |
| Privacy | Sensitive item details masked on public detail view; contact info shared only on verified claim |
