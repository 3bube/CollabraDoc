@echo off
REM CollabraDoc Development Startup Script for Windows
REM This script starts all the necessary services for development

echo 🚀 Starting CollabraDoc Development Environment...

REM Check if MongoDB is running (Windows)
echo 📊 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running. Please start MongoDB first:
    echo    mongod
    pause
    exit /b 1
)

REM Check if ports are in use
echo 🔍 Checking ports...
netstat -an | findstr ":8000" >nul
if %ERRORLEVEL%==0 (
    echo ⚠️  Port 8000 is already in use. Please stop the service using port 8000 first.
    pause
    exit /b 1
)

netstat -an | findstr ":1234" >nul
if %ERRORLEVEL%==0 (
    echo ⚠️  Port 1234 is already in use. Please stop the service using port 1234 first.
    pause
    exit /b 1
)

netstat -an | findstr ":3000" >nul
if %ERRORLEVEL%==0 (
    echo ⚠️  Port 3000 is already in use. Please stop the service using port 3000 first.
    pause
    exit /b 1
)

echo ✅ All ports are available

REM Start backend server
echo 🔧 Starting FastAPI backend server...
cd backend
if not exist ".env" (
    echo ⚠️  No .env file found in backend/. Creating a default one...
    echo MONGODB_URL=mongodb://localhost:27017> .env
    echo JWT_SECRET=your-secret-key-change-this-in-production>> .env
)
start "Backend Server" cmd /k "uvicorn main:app --reload --port 8000"
cd ..

REM Start WebSocket server
echo 🔌 Starting WebSocket server...
cd websocket-server
start "WebSocket Server" cmd /k "node server.js"
cd ..

REM Start frontend
echo 🎨 Starting Next.js frontend...
cd frontend
if not exist ".env.local" (
    echo ⚠️  No .env.local file found in frontend/. Creating a default one...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000> .env.local
    echo NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production>> .env.local
    echo NEXTAUTH_URL=http://localhost:3000>> .env.local
)
start "Frontend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for services to start
timeout /t 3 /nobreak >nul

echo.
echo 🎉 CollabraDoc is starting up!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 🔌 WebSocket: ws://localhost:1234
echo.
echo 📋 Services started in separate windows:
echo    - Frontend (Next.js)
echo    - Backend (FastAPI)
echo    - WebSocket Server
echo.
echo 🛑 Close the command windows to stop the services
echo.
pause 