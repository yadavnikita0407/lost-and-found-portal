# Deployment Guide: Campus Lost & Found Portal

This guide provides step-by-step instructions for deploying the **Express backend to Render** and the **React (Vite) frontend to Vercel**.

---

## Architecture Overview

```
                      ┌──────────────────────────────┐
                      │    Frontend (Vercel)         │
                      │  React + Vite SPA            │
                      │  https://<app>.vercel.app    │
                      └──────────────┬───────────────┘
                                     │ HTTPS / CORS
                                     ▼
                      ┌──────────────────────────────┐
                      │    Backend (Render)          │
                      │  Node.js / Express Web Svc   │
                      │  https://<api>.onrender.com  │
                      └───────┬──────────────┬───────┘
                              │              │
                              ▼              ▼
                    ┌──────────────┐   ┌──────────────┐
                    │ MongoDB Atlas│   │  Cloudinary  │
                    │   Database   │   │ Photo Storage│
                    └──────────────┘   └──────────────┘
```

---

## Part 1: Deploy Backend to Render

### Option A: Using the Included Blueprint (`render.yaml`)

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com/).
3. Click **Blueprints** → **New Blueprint Instance**.
4. Connect your GitHub repository.
5. Render will automatically detect [`render.yaml`](file:///C:/Users/Sarvesh%20Haldikar/lost-and-found-portal/render.yaml) and configure the `lost-and-found-api` service.
6. Fill in the required secret variables (`MONGO_URI`, `CLOUDINARY_*`) prompted in the dashboard.
7. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render

1. Sign in to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `lost-and-found-api` (or your choice)
   - **Region**: Oregon (US West) or closest to your users
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Advanced** → **Health Check Path**:
   - Set to `/api/health`
5. Add the following **Environment Variables**:

| Variable Name | Required | Description / Example Value |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Render sets this automatically (defaults to `10000`) |
| `MONGO_URI` | Yes | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/lostfound?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Random secure string (min. 32 characters) |
| `JWT_EXPIRES_IN` | Optional | `7d` |
| `CLIENT_ORIGIN` | Yes | `https://<your-vercel-app>.vercel.app,http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Your Cloudinary API secret |
| `STORAGE` | Optional | `cloudinary` |

6. Click **Create Web Service**.
7. Once deployed, copy your service URL (e.g., `https://lost-and-found-api.onrender.com`).
8. Verify health by visiting `https://lost-and-found-api.onrender.com/api/health` in your browser. Expected response:
   ```json
   { "success": true, "message": "Server is healthy" }
   ```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Repository

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Select and import your GitHub repository.

### Step 2: Configure Project Settings

1. **Framework Preset**: `Vite` (automatically detected).
2. **Root Directory**: Click **Edit** and select `client`.
3. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Environment Variables**:
   Add the API endpoint pointing to your Render backend:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-service-name>.onrender.com/api`

> [!IMPORTANT]
> Ensure the `/api` path is included at the end of `VITE_API_URL` (e.g., `https://lost-and-found-api.onrender.com/api`).

5. Click **Deploy**.

---

## Part 3: Connecting Frontend & Backend

Once your Vercel deployment completes:

1. Copy your Vercel production domain (e.g., `https://lost-and-found-portal.vercel.app`).
2. Go back to your **Render Dashboard** → Web Service → **Environment**.
3. Update `CLIENT_ORIGIN` to include your Vercel domain:
   ```
   CLIENT_ORIGIN=https://lost-and-found-portal.vercel.app,http://localhost:5173
   ```
   *(Note: The backend CORS configuration automatically allows any `*.vercel.app` domain as well as localhost)*.
4. Render will automatically redeploy with the updated origin setting.

---

## Part 4: Database Seeding (Optional)

To populate sample institutional records and demo members on your production MongoDB Atlas cluster:

1. In your local terminal, point to the remote cluster:
   ```powershell
   $env:MONGO_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/lostfound"
   cd server
   node src/scripts/seed.js
   ```
2. This creates:
   - Admin account: `admin@college.edu` / `Password123`
   - Student account: `student@college.edu` / `Password123`
   - Sample registered lost and found items.

---

## Part 5: Deployment Verification Checklist

- [ ] Render health check returns `200 OK` on `/api/health`.
- [ ] Vercel homepage renders cleanly without console errors.
- [ ] Direct URL navigation (e.g. refreshing on `/dashboard` or `/items`) works without 404s (handled by [`client/vercel.json`](file:///C:/Users/Sarvesh%20Haldikar/lost-and-found-portal/client/vercel.json) rewrites).
- [ ] Student login and registration flow completes with JWT token stored.
- [ ] Photo upload with found report works and appears on Cloudinary CDN.
- [ ] Admin console (`/admin/login`) authorizes administrative accounts.

---

## Troubleshooting

### Render Free Tier Cold Starts
Render free web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to respond. Subsequent requests are fast.

### Single Page Application (SPA) 404 on Refresh
If refreshing any page (e.g. `/my-reports`) shows a 404 error, ensure [`client/vercel.json`](file:///C:/Users/Sarvesh%20Haldikar/lost-and-found-portal/client/vercel.json) is present with the rewrite rules:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
This is already pre-configured for both root and `client/` deployments.

### CORS Errors in Browser Console
If requests fail with `No 'Access-Control-Allow-Origin' header`:
1. Check that `CLIENT_ORIGIN` on Render includes your exact Vercel URL (without trailing slash).
2. Check that the browser request URL is using `https://` (not `http://`).
