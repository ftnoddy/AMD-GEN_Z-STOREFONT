# Deploy Storefront + Backend to Vercel — Step by Step

Follow these steps in order. Deploy the **backend first**, then the **storefront**, so you can use the backend URL in the storefront env.

---

## Part 1: Deploy Backend to Vercel

### Step 1: Open Vercel and sign in
1. Go to **https://vercel.com**
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub** and authorize Vercel

### Step 2: Import the backend repository
1. Click **Add New…** → **Project**
2. Find and select **multi-tenant-inventory-system** (or the repo that contains your `backend` folder)
3. If you don’t see it, click **Import Git Repository** and connect GitHub, then select the repo

### Step 3: Configure the backend project
1. **Project Name**: e.g. `amd-genz-backend`
2. **Root Directory**: Click **Edit** and set to **`backend`** (so Vercel builds from the backend folder)
3. **Framework Preset**: Other (or leave as detected)
4. **Build Command**: `npm run build` (or leave default)
5. **Output Directory**: leave empty (API project)
6. **Install Command**: `npm install`

### Step 4: Add backend environment variables
Before deploying, click **Environment Variables** and add:

| Name         | Value                                      | Environment  |
|-------------|---------------------------------------------|-------------|
| `NODE_ENV`  | `production`                                | Production  |
| `PORT`      | `3000`                                     | Production  |
| `MONGO_URI` | Your MongoDB Atlas connection string        | Production  |
| `SECRET_KEY`| A long random string (e.g. 32+ chars)      | Production  |
| `JWT_SECRET`| A long random string (e.g. 32+ chars)      | Production  |
| `ORIGIN`    | Leave empty for now; set after storefront  | Production  |
| `CREDENTIALS` | `true`                                   | Production  |
| `LOG_FORMAT`  | `combined`                               | Production  |

**MongoDB**: Use the same connection string as in `.env.development.local` (e.g. from MongoDB Atlas).

### Step 5: Deploy the backend
1. Click **Deploy**
2. Wait for the build to finish (can take 2–5 minutes)
3. When it’s done, open the **Visit** link (e.g. `https://amd-genz-backend-xxx.vercel.app`)
4. **Copy this URL** — you’ll use it for the storefront (e.g. `https://amd-genz-backend-xxx.vercel.app`)

### Step 6: Test the backend
- Open: `https://your-backend-url.vercel.app/api`  
  You should get a response (e.g. “OK” or JSON), not a 404.

---

## Part 2: Deploy Storefront to Vercel

### Step 7: Create the storefront project
1. In Vercel, click **Add New…** → **Project**
2. Select the **AMD-GEN_Z-STOREFONT** repository (or the repo that contains your storefront)
3. If the repo has both frontend and backend, set **Root Directory** to the folder that has `package.json` and `vite.config.ts` (usually the repo root for the storefront-only repo)

### Step 8: Configure the storefront project
1. **Project Name**: e.g. `amd-genz-storefront`
2. **Framework Preset**: **Vite** (Vercel usually detects this)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 9: Add storefront environment variable
1. Open **Environment Variables**
2. Add:

| Name            | Value                                      | Environment |
|-----------------|--------------------------------------------|-------------|
| `VITE_API_URL`  | `https://your-backend-url.vercel.app`      | Production  |

Use the **exact** backend URL from Step 5 (no `/api` at the end — the app adds `/api` in code).

Example:  
If backend URL is `https://amd-genz-backend-xxx.vercel.app`, then:
- **VITE_API_URL** = `https://amd-genz-backend-xxx.vercel.app`

### Step 10: Deploy the storefront
1. Click **Deploy**
2. Wait for the build to finish
3. Click **Visit** to open the live site

### Step 11: Allow storefront in backend CORS (ORIGIN)
1. In Vercel, open your **backend** project
2. Go to **Settings** → **Environment Variables**
3. Edit **ORIGIN** and set it to your storefront URL, e.g.  
   `https://amd-genz-storefront-xxx.vercel.app`
4. **Redeploy** the backend (Deployments → … → Redeploy) so the new ORIGIN is used

---

## Part 3: Verify Everything

### Checklist
- [ ] Backend URL opens (e.g. `https://your-backend.vercel.app/api`) and returns something (not 404)
- [ ] Storefront URL opens and loads the app
- [ ] Storefront can load products (catalog)
- [ ] Login/Register works (if you have auth)
- [ ] No CORS errors in browser DevTools (F12 → Console)

### If the storefront can’t reach the backend
1. Confirm **VITE_API_URL** = backend URL with no trailing slash and no `/api`
2. Confirm **ORIGIN** on the backend = storefront URL
3. Redeploy both projects after changing env vars

### If backend build fails on Vercel
- Ensure **Root Directory** is set to **`backend`** when the repo contains a `backend` folder
- Check **Build Command** is `npm run build`
- In **Settings → General**, set **Node.js Version** to 18.x or 20.x if needed

---

## Quick reference: URLs

| What        | Example URL |
|------------|-------------|
| Backend    | `https://amd-genz-backend-xxx.vercel.app` |
| Backend API| `https://amd-genz-backend-xxx.vercel.app/api` |
| Storefront | `https://amd-genz-storefront-xxx.vercel.app` |

---

## Summary

1. Deploy **backend** first (root directory = `backend`, add env vars, copy URL).
2. Deploy **storefront** (set `VITE_API_URL` = backend URL).
3. Set backend **ORIGIN** to storefront URL and redeploy backend.
4. Test: open storefront, check catalog and login.

That’s the full flow to deploy both storefront and backend on Vercel step by step.
