# Samara Repository

Full-stack application for managing academic repository with React frontend, Express backend, and Supabase database.

## Project Structure

This project is organized into two independent folders:

```
samara-repository/
├── frontend/        # React application
├── backend/         # Express server
├── setup.bat        # Windows setup script
└── README.md        # This file
```

## Quick Start

### Option 1: Automated Setup (Windows)

Run the setup script to install dependencies and create environment files:

```bash
setup.bat
```

### Option 2: Manual Setup

**1. Setup Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
```

**2. Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

You need to run both frontend and backend in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
React app runs on http://localhost:3000

## Environment Configuration

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `COOKIE_SECRET` - Random 64-character hex string
- `CSRF_SECRET` - Random 64-character hex string
- `CLIENT_URL` - Frontend URL (default: http://localhost:3000)

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Documentation

- [Frontend README](./frontend/README.md) - Frontend setup and development
- [Backend README](./backend/README.md) - Backend setup and API documentation
- [Backend API Reference](./backend/API_REFERENCE.md) - Detailed API documentation
- [Backend Setup Guide](./backend/SETUP_GUIDE.md) - Backend configuration guide

## Technology Stack

**Frontend:**
- React 19.2.0
- React Router
- React Bootstrap
- Supabase Client
- FontAwesome Icons

**Backend:**
- Express 5.2.1
- Supabase (Service Role)
- bcrypt for password hashing
- helmet for security
- CORS for cross-origin requests
- express-rate-limit for rate limiting

**Database:**
- Supabase (PostgreSQL)

## Development Workflow

1. Make sure backend is running first
2. Start frontend development server
3. Frontend will proxy API requests to backend
4. Both support hot-reloading during development

## Deployment

**Frontend:**
- Build: `npm run build` (in frontend/)
- Deploy to: Vercel, Netlify, or any static hosting
- Set environment variables in hosting platform

**Backend:**
- Deploy to: Render, Railway, Heroku, or any Node.js hosting
- Set environment variables in hosting platform
- Update `CLIENT_URL` to production frontend URL

## Security Best Practices

✅ **DO:**
- Keep `.env` files out of version control
- Use service role key only on backend
- Configure CORS properly
- Use httpOnly cookies for authentication
- Keep dependencies updated

❌ **DON'T:**
- Expose service role keys to frontend
- Store sensitive tokens in localStorage
- Commit `.env` files
- Use same secrets in development and production

## License

See LICENSE file for details.




-- Create OTPs table for password reset functionality
CREATE TABLE IF NOT EXISTS otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(64) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'password_reset',
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_otps_email_type ON otps(email, type);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- Enable RLS
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can manage OTPs" ON otps
    FOR ALL USING (auth.role() = 'service_role');
