# Deployment Guide - Samara Repository

This guide explains how to deploy the frontend and backend separately:
- **Frontend**: Vercel
- **Backend**: Render

## Prerequisites

- GitHub account with your repository pushed
- Vercel account (free tier available)
- Render account (free tier available)
- Supabase project with credentials

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `samara-repository` repository

### Step 2: Configure Render Service

Fill in the following settings:

- **Name**: `samara-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or your preferred tier)

### Step 3: Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default |
| `SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | From Supabase → Settings → API |
| `CLIENT_URL` | `https://your-app.vercel.app` | Will update after Vercel deployment |
| `COOKIE_SECRET` | Generate random 64-char hex | See below for generation |
| `CSRF_SECRET` | Generate random 64-char hex | See below for generation |

**Generate secrets** (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://samara-backend.onrender.com`
4. Test the health endpoint: `https://samara-backend.onrender.com/api/health`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your `samara-repository` repository

### Step 2: Configure Vercel Project

Fill in the following settings:

- **Project Name**: `samara-repository-frontend` (or your preferred name)
- **Framework Preset**: `Create React App`
- **Root Directory**: `frontend` ← **IMPORTANT: Click "Edit" and set this!**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `build` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `REACT_APP_API_URL` | `https://samara-backend.onrender.com` | Your Render backend URL |
| `REACT_APP_SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase dashboard |
| `REACT_APP_SUPABASE_ANON_KEY` | `your-anon-key` | From Supabase → Settings → API |

> **Note**: Make sure to use `REACT_APP_` prefix for all environment variables in React apps!

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete (3-5 minutes)
3. Note your frontend URL: `https://samara-repository-frontend.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Navigate to your backend service
3. Update the `CLIENT_URL` environment variable to your Vercel URL:
   - `CLIENT_URL` = `https://samara-repository-frontend.vercel.app`
4. Save changes (this will trigger a redeploy)

---

## Part 3: Verify Deployment

### Test Backend

1. Open browser and navigate to: `https://samara-backend.onrender.com/api/health`
2. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-08T...",
     "environment": "production"
   }
   ```

### Test Frontend

1. Open browser and navigate to your Vercel URL
2. The landing page should load correctly
3. Try to register a new user
4. Try to login with the registered user
5. Verify all pages work correctly

### Check Browser Console

1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab to verify API calls are going to Render backend
4. Verify no CORS errors

---

## Part 4: Update Frontend API Configuration

If your frontend has hardcoded API URLs, you need to update them to use the environment variable.

### Check for Hardcoded URLs

Search your frontend code for:
- `http://localhost:5000`
- `localhost:5000`
- Any hardcoded API endpoints

### Use Environment Variable

Update API calls to use:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

Example:
```javascript
// Before
fetch('http://localhost:5000/api/auth/login', { ... })

// After
fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, { ... })
```

---

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `backend/package.json` has correct start script

**Problem**: CORS errors
- Verify `CLIENT_URL` matches your Vercel URL exactly
- Check for trailing slashes (should not have one)
- Ensure Vercel URL is using HTTPS

### Frontend Issues

**Problem**: API calls fail
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for exact error
- Verify backend is running and accessible

**Problem**: Environment variables not working
- Ensure variables start with `REACT_APP_`
- Redeploy frontend after adding variables
- Clear browser cache

**Problem**: 404 on page refresh
- Vercel should handle this with `vercel.json` rewrites
- Verify `vercel.json` exists in frontend folder

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys when you push to your main branch
- **Render**: Automatically deploys when you push to your main branch

To disable auto-deploy:
- **Vercel**: Settings → Git → Disable auto-deploy
- **Render**: Settings → Build & Deploy → Disable auto-deploy

---

## Cost Considerations

### Free Tier Limits

**Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Serverless function execution limits

### Upgrading

If you need better performance:
- **Render**: Upgrade to Starter ($7/month) for always-on service
- **Vercel**: Upgrade to Pro ($20/month) for higher limits

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Supabase service role key is only in backend
- [ ] Frontend only uses Supabase anon key
- [ ] CORS is configured to only allow your frontend domain
- [ ] All secrets are generated randomly (not defaults)
- [ ] HTTPS is enabled on both frontend and backend

---

## Next Steps

1. Set up custom domain (optional)
2. Configure email verification in Supabase
3. Set up monitoring and error tracking
4. Configure backup strategy
5. Set up staging environment

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
