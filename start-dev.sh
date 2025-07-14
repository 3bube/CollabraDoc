#!/bin/bash

# CollabraDoc Development Startup Script
# This script starts all the necessary services for development

echo "🚀 Starting CollabraDoc Development Environment..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the service using port $1 first."
        return 1
    fi
    return 0
}

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   mongod"
    exit 1
fi
echo "✅ MongoDB is running"

# Check ports
echo "🔍 Checking ports..."
check_port 8000 || exit 1
check_port 1234 || exit 1
check_port 3000 || exit 1

echo "✅ All ports are available"

# Start backend server
echo "🔧 Starting FastAPI backend server..."
cd backend
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found in backend/. Creating a default one..."
    cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key-change-this-in-production
EOF
fi
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start WebSocket server
echo "🔌 Starting WebSocket server..."
cd websocket-server
node server.js &
WEBSOCKET_PID=$!
cd ..

# Start frontend
echo "🎨 Starting Next.js frontend..."
cd frontend
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found in frontend/. Creating a default one..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
EOF
fi
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for services to start
sleep 3

echo ""
echo "🎉 CollabraDoc is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🔌 WebSocket: ws://localhost:1234"
echo ""
echo "📋 Services:"
echo "   - Frontend (Next.js): PID $FRONTEND_PID"
echo "   - Backend (FastAPI): PID $BACKEND_PID"
echo "   - WebSocket Server: PID $WEBSOCKET_PID"
echo ""
echo "🛑 To stop all services, run: kill $FRONTEND_PID $BACKEND_PID $WEBSOCKET_PID"
echo ""

# Function to handle cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Stopping CollabraDoc services..."
    kill $FRONTEND_PID $BACKEND_PID $WEBSOCKET_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
echo "⏳ Press Ctrl+C to stop all services"
wait 