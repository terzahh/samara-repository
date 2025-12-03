@echo off
echo Creating server/.env file...
echo.

(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # Supabase Configuration
echo # TODO: Replace with your actual Supabase credentials
echo SUPABASE_URL=https://your-project.supabase.co
echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
echo.
echo # Secrets ^(Generated - DO NOT CHANGE^)
echo COOKIE_SECRET=65a01283e2b212d06e2e3116c86c4ded86a2eee398a676876a31d740c2f8b279
echo CSRF_SECRET=12eff73e8e4075d19898181e9eb9a7a23482d1acff1bce79b8a2e6b767e62f43
echo.
echo # Session Configuration
echo SESSION_DURATION_MS=86400000
echo INACTIVITY_TIMEOUT_MS=1800000
echo REFRESH_TOKEN_EXPIRY_MS=1209600000
echo.
echo # Security
echo COOKIE_DOMAIN=
echo CLIENT_URL=http://localhost:3000
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_LOGIN=5
echo RATE_LIMIT_MAX_REGISTER=3
echo RATE_LIMIT_MAX_REFRESH=10
echo.
echo # Device Fingerprint
echo FINGERPRINT_TOLERANCE=80
) > server\.env

echo.
echo ✅ Created server/.env file
echo.
echo ⚠️  IMPORTANT: Edit server/.env and add your Supabase credentials:
echo    - SUPABASE_URL
echo    - SUPABASE_SERVICE_ROLE_KEY
echo.
echo Get them from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
echo.
pause
