# Express Backend Setup Guide

## 🚀 Quick Start

Follow these steps to set up and run the security-hardened Express backend.

---

## Step 1: Generate Secrets

Generate cryptographically secure secrets for cookies and CSRF tokens:

```bash
# Generate COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CSRF_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy these values - you'll need them in the next step.

---

## Step 2: Create Environment File

Create `server/.env` file:

```bash
# Copy the example file
cp server/.env.example server/.env
```

Edit `server/.env` and fill in the values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# Secrets (paste the values you generated above)
COOKIE_SECRET=paste_first_generated_secret_here
CSRF_SECRET=paste_second_generated_secret_here

# Session Configuration (defaults are fine)
SESSION_DURATION_MS=86400000
INACTIVITY_TIMEOUT_MS=1800000
REFRESH_TOKEN_EXPIRY_MS=1209600000

# Security
CLIENT_URL=http://localhost:3000

# Rate Limiting (defaults are fine)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_LOGIN=5
RATE_LIMIT_MAX_REGISTER=3
RATE_LIMIT_MAX_REFRESH=10

# Device Fingerprint
FINGERPRINT_TOLERANCE=80
```

**Where to find Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy "Project URL" → paste as `SUPABASE_URL`
4. Copy "service_role" key (under "Project API keys") → paste as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT:** Never commit `.env` file to git! It's already in `.gitignore`.

---

## Step 3: Run Database Migrations

1. Open Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy the contents of `server/migrations/001_create_sessions_and_logs.sql`
3. Paste into SQL Editor
4. Click "Run"

**Verify migration succeeded:**

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sessions', 'activity_logs');

-- Should return 2 rows: sessions, activity_logs
```

---

## Step 4: Update User Passwords (One-Time Migration)

Your existing users have plain-text passwords. We need to hash them with bcrypt.

**Option A: Reset all passwords (recommended for development)**

```sql
-- This will require all users to reset their passwords
UPDATE users SET password_hash = NULL;
```

Then notify users to use "Forgot Password" flow.

**Option B: Hash existing passwords (if you know them)**

Run this Node.js script:

```javascript
// hash-passwords.js
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function hashPasswords() {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, password_hash');
  
  for (const user of users) {
    // If password is not already hashed (bcrypt hashes start with $2b$)
    if (!user.password_hash.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(user.password_hash, 10);
      await supabase
        .from('users')
        .update({ password_hash: hashed })
        .eq('id', user.id);
      console.log(`Hashed password for ${user.email}`);
    }
  }
}

hashPasswords();
```

---

## Step 5: Start the Server

```bash
# From project root
npm start
```

This will start both:
- **Express backend** on http://localhost:5000
- **React frontend** on http://localhost:3000

You should see:

```
🚀 Express Backend Server Started
=====================================
Environment: development
Port: 5000
Client URL: http://localhost:3000

Available endpoints:
  GET  /api/health
  POST /api/auth/login
  POST /api/auth/register
  POST /api/auth/logout
  POST /api/auth/refresh
  GET  /api/auth/me
  POST /api/auth/ping
=====================================
```

---

## Step 6: Test the Backend

### Test with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'

# Get current user (using cookies from login)
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Test with Postman/Insomnia

1. Import the endpoints:
   - POST `http://localhost:5000/api/auth/login`
   - GET `http://localhost:5000/api/auth/me`
   - POST `http://localhost:5000/api/auth/refresh`
   - POST `http://localhost:5000/api/auth/logout`

2. Enable cookie jar in Postman settings

3. Test login → cookies should be set automatically

4. Test /me → should return user data

---

## Step 7: Verify Security Features

### Test Session Expiration

```sql
-- Manually expire a session
UPDATE sessions 
SET expires_at = NOW() - INTERVAL '1 hour'
WHERE user_id = 'your_user_id';
```

Then try to access `/api/auth/me` → should return 401

### Test Replay Detection

1. Login and capture the refresh token cookie
2. Call `/api/auth/refresh` → new token issued
3. Try to use the OLD refresh token again → should detect replay and revoke session

### Test Device Fingerprint

1. Login from Chrome
2. Change User-Agent header to Firefox
3. Call `/api/auth/refresh` → should log warning but allow (80% tolerance)
4. Change User-Agent to completely different device → should challenge/revoke

### Test Rate Limiting

1. Make 6 failed login attempts → should be rate limited
2. Wait 15 minutes → should be able to try again

---

## Troubleshooting

### "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

- Make sure `server/.env` file exists
- Check that values are correct (no quotes, no spaces)

### "Cannot reach authentication server"

- Verify Supabase URL is correct
- Check internet connection
- Verify Supabase project is not paused

### "Database access denied"

- Check RLS policies are set correctly
- Verify service role key has admin privileges

### "Port 5000 already in use"

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or change PORT in server/.env
PORT=5001
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. ✅ Backend is running
2. ⏳ Update React client to use backend API
3. ⏳ Test full authentication flow
4. ⏳ Deploy to production

See `CLIENT_INTEGRATION.md` for instructions on updating the React app.

---

## Production Deployment

### Environment Variables

Set these in your hosting platform (Heroku, Railway, etc.):

- `NODE_ENV=production`
- `SUPABASE_URL=your_production_url`
- `SUPABASE_SERVICE_ROLE_KEY=your_production_key`
- `COOKIE_SECRET=strong_random_secret`
- `CSRF_SECRET=another_strong_random_secret`
- `CLIENT_URL=https://your-frontend-domain.com`

### Security Checklist

- [ ] HTTPS enabled (required for Secure cookies)
- [ ] Strong secrets generated (not defaults)
- [ ] Service role key stored in secret manager
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring/alerting set up (Sentry, Datadog)

---

## Support

If you encounter issues:

1. Check the logs in terminal
2. Check Supabase logs
3. Verify all environment variables are set
4. Test endpoints with Postman
5. Check `activity_logs` table for security events

```sql
-- View recent activity
SELECT * FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- View suspicious activity
SELECT * FROM activity_logs 
WHERE severity IN ('warning', 'critical')
ORDER BY created_at DESC;
```
