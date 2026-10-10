# College Lost & Found Portal

A centralized, secure web application for reporting, finding, and recovering lost belongings on campus — restricted to authorized college members.

---

## Overview

Students and staff frequently lose personal belongings on campus. Existing methods like classroom groups and notice boards are fragmented and hard to track. This portal provides a single organized platform to report lost/found items, submit ownership claims, and facilitate verified returns — all within a role-based, privacy-conscious system.

---

## Features

- **College-restricted access** — registration verified against an authorized member list
- **Lost & Found reporting** — with photos, categories, location, and item details
- **Smart match suggestions** — automatically compares lost and found reports by name, category, colour, brand, and location
- **Ownership claims** — users submit claims; admins review and verify before handover
- **Notifications** — on report approval, match suggestions, claim updates, and item return
- **Admin dashboard** — manage reports, claims, users, and view portal statistics
- **Audit logging** — tracks administrative and security-relevant actions
- **Responsive UI** — works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) |
| ODM | Mongoose |
| Auth | JWT + bcryptjs |
| Image handling | Multer + Cloudinary |
| Version control | Git + GitHub |
| Frontend hosting | Vercel / Netlify |
| Backend hosting | Render |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (optional for development)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/lost-and-found-portal.git
cd lost-and-found-portal
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lostfound
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files. They are listed in `.gitignore`.

---

## Project Structure

```
lost-and-found-portal/
├── client/                  # React frontend
├── server/                  # Express backend
├── .gitignore
└── README.md
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory structure and module breakdown.

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start in production mode |
| `npm test` | Run tests |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## User Roles

| Role | Description |
|---|---|
| **Student** | Register, report items, search, claim, track |
| **Staff** | Same as Student; separate eligibility rules |
| **Admin** | Full dashboard access — manage reports, claims, users |

Admin accounts are not created through ordinary registration.

---

## Workflows

**Lost item:** Login → Report lost item → System suggests matches → Submit claim → Admin verifies → Item returned

**Found item:** Login → Report found item → System suggests matches → Owner submits claim → Admin verifies → Marked as returned

---

## Team

| Member | Role |
|---|---|
| Member 1 | Frontend — React UI, layouts, API integration |
| Member 2 | Backend — Express routes, auth, matching logic |
| Member 3 | Database, integration, testing, deployment |

---

## Git Workflow

- `main` — stable, production-ready code
- `dev` — integration branch
- Feature branches: `feat/<feature-name>`
- Each member works on their own branch and opens pull requests into `dev`

---

## Testing Checklist

- [ ] Registration (valid and invalid PRN/email)
- [ ] Login and session handling
- [ ] Role-based access restrictions
- [ ] Lost and found report submission
- [ ] Image upload validation
- [ ] Search and filter accuracy
- [ ] Claim submission and admin review
- [ ] Match suggestion generation
- [ ] Notifications delivery
- [ ] Admin report and user management
- [ ] Responsive layout on mobile/tablet

---

## Deployment

| Service | Purpose |
|---|---|
| Vercel / Netlify | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Database |
| Cloudinary | Image storage |

Configure `CLIENT_ORIGIN` on the backend and `VITE_API_URL` on the frontend for your production URLs before deploying.

---

## License

For academic use only. Not licensed for commercial distribution.
