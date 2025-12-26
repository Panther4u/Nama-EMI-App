#!/bin/bash

# Kill any existing processes on ports 5000 and 8080
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null

echo "Starting Nama EMI App..."

# Start Backend
echo "1. Starting Backend (Port 5000)..."
cd server
npm install
# running node directly is often more reliable than npm start in scripts
nohup node index.js > ../server.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 2

# Start Frontend
cd ..
echo "2. Starting Frontend (Port 8080)..."
npm install
npm run dev
