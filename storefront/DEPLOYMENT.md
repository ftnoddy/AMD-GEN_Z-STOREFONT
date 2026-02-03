# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub account with your repository pushed
- MongoDB Atlas database URL (or your MongoDB connection string)

## Deploy Storefront (This Repository)

###1. **Push to GitHub** ✅ (Already Done!)
   - Repository: `https://github.com/ftnoddy/AMD-GEN_Z-STOREFONT.git`

### 2. **Deploy to Vercel**

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to storefront directory
cd d:\tech-exactly\storefront

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project's name? amd-genz-storefront
# - In which directory is your code located? ./
# - Want to override the settings? No

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `ftnoddy/AMD-GEN_Z-STOREFONT`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `<your-backend-vercel-url>/api`
     (You'll get this URL after deploying the backend)

6. Click **Deploy**

### 3. **Update Environment Variables After Backend Deployment**
Once your backend is deployed, update the storefront's environment variable:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Edit `VITE_API_BASE_URL` to point to your deployed backend URL
4. Redeploy the project

---

## Deploy Backend

### 1. **Push Backend to GitHub**
The backend needs to be in a separate repository or you can deploy from the `backend/` directory:
   - Repository: `https://github.com/ftnoddy/multi-tenant-inventory-system.git`

### 2. **Important: Backend Considerations for Vercel**

⚠️ **Note**: Vercel has limitations for backend deployment:
- Serverless functions have a 10-second execution timeout on free tier
- Socket.io may not work properly in serverless environment
- MongoDB connections need to be optimized for serverless

**Recommended Alternative**: Deploy backend to **Render** or **Railway** instead of Vercel
- Render: Better for Node.js backends with Socket.io
- Railway: Good for full-stack apps with databases

### 3. **If Deploying Backend to Vercel Anyway**:

1. Go to https://vercel.com/new
2. Import `ftnoddy/multi-tenant-inventory-system`
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (if in monorepo) or `./`
   - **Build Command**: `npm run build` (or leave empty for Vercel to detect)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables** (CRITICAL):
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=7d
   ORIGIN=<your-storefront-vercel-url>
   CREDENTIALS=true
   LOG_FORMAT=combined
   ```

5. Click **Deploy**

### 4. **After Backend Deployment**:
- Copy the backend Vercel URL
- Go back to storefront project settings
- Update `VITE_API_BASE_URL` environment variable
- Redeploy storefront

---

## Alternative: Deploy Backend to Render (Recommended)

### Why Render for Backend?
- Better support for long-running processes
- Native Socket.io support
- No 10-second timeout limit
- Free tier available

### Steps:
1. Go to https://render.com
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: amd-genz-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. Add Environment Variables (same as above)

7. Click "Create Web Service"

---

## Testing Your Deployment

### Storefront:
```bash
# Your storefront URL will be something like:
https://amd-genz-storefront.vercel.app
```

Test:
- Open the URL in browser
- Try logging in
- Browse products
- Add items to cart

### Backend:
```bash
# Test backend API (replace with your URL)
curl https://your-backend-url.vercel.app/api/health
```

---

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Make sure all dependencies are in `package.json`, not just `devDependencies`

### Issue: Environment variables not working
**Solution**: 
- For Vite (storefront), all env vars must start with `VITE_`
- Redeploy after adding/changing environment variables

### Issue: CORS errors
**Solution**: Update backend `ORIGIN` environment variable to include your storefront URL

### Issue: 500 errors on backend
**Solution**: Check Vercel logs for details:
```bash
vercel logs <your-backend-url>
```

---

## Monitoring & Logs

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check logs for errors
- Monitor performance

### Enable Analytics (Optional)
1. Go to project settings
2. Analytics tab
3. Enable Web Analytics

---

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Global CDN

### Render Free Tier:
- 750 hours/month
- Auto-sleep after 15 min of inactivity
- 512 MB RAM
- Shared CPU

---

## Next Steps

1. ✅ Deploy Storefront to Vercel
2. ✅ Deploy Backend to Render (recommended) or Vercel
3. ✅ Update environment variables
4. ✅ Test the complete application
5. ✅ Set up custom domain (optional)
6. ✅ Enable monitoring and analytics

---

## Support

If you encounter issues:
1. Check Vercel/Render logs
2. Verify environment variables are set correctly
3. Test API endpoints manually
4. Check GitHub repository has latest code

**Deployment Status**: Ready to Deploy! 🚀
