# Separate Deployment Steps

## Backend → Render

### 1. Create Render Service
- Go to [render.com/dashboard](https://dashboard.render.com/)
- Click **New +** → **Web Service**
- Connect your GitHub repository

### 2. Configure Service
```
Name: samara-backend
Region: Choose closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 3. Add Environment Variables
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_URL=https://your-app.vercel.app
COOKIE_SECRET=generate_random_64_char_hex
CSRF_SECRET=generate_random_64_char_hex
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy
- Click **Create Web Service**
- Wait 5-10 minutes
- Copy your backend URL: `https://samara-backend.onrender.com`
- Test: `https://samara-backend.onrender.com/api/health`

---

## Frontend → Vercel

### 1. Create Vercel Project
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click **Add New...** → **Project**
- Import your GitHub repository

### 2. Configure Project
```
Project Name: samara-repository-frontend
Framework Preset: Create React App
Root Directory: frontend ← IMPORTANT! Click "Edit" and set this
Build Command: npm run build
Output Directory: build
```

### 3. Add Environment Variables
```
REACT_APP_API_URL=https://samara-backend.onrender.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Deploy
- Click **Deploy**
- Wait 3-5 minutes
- Copy your frontend URL: `https://your-app.vercel.app`

---

## Final Step: Update CORS

### Go back to Render
1. Open your backend service
2. Go to **Environment**
3. Update `CLIENT_URL` to your Vercel URL
4. Save (auto-redeploys)

---

## Test Everything

1. **Backend**: Visit `https://samara-backend.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Login**: Try logging in to verify API connection
4. **Console**: Check browser console for errors

---

## Important Notes

⚠️ **Vercel Root Directory**: Must set to `frontend` in dashboard settings

⚠️ **Environment Variables**: 
- Backend uses `SUPABASE_SERVICE_ROLE_KEY`
- Frontend uses `SUPABASE_ANON_KEY` (different!)

⚠️ **Render Free Tier**: Spins down after 15 min inactivity (first request takes ~30s)

---

## Get Your Supabase Keys

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **URL**: Project URL
   - **anon/public**: For frontend
   - **service_role**: For backend (keep secret!)
