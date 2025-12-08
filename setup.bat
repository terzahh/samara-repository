@echo off
echo Setting up Samara Repository - Separated Frontend and Backend
echo.

echo Creating frontend .env file...
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env - Please update with your configuration
) else (
    echo frontend\.env already exists
)

echo.
echo Creating backend .env file...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env - Please update with your configuration
) else (
    echo backend\.env already exists
)

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update frontend\.env with your Supabase URL and anon key
echo 2. Update backend\.env with your Supabase service role key and secrets
echo 3. Generate secrets for backend with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.
echo To run the application:
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm start
echo.
pause
