@echo off
title En-Nilam Project Execution
echo Starting En-Nilam services...
echo.

:: Navigate to en-nilam-contracts and start Hardhat node
cd /d D:\React\en-nilam-contracts
start cmd /k "npx hardhat node"

:: Wait for Hardhat node to start
timeout /t 5

:: Deploy contracts
start cmd /k "npx hardhat run .\scripts\deploy.js --network localhost"

:: Start Hardhat server
start cmd /k "node server.js"

:: Navigate to en-nilam-backend and start the backend server
cd /d D:\React\en-nilam-backend
start cmd /k "node server.js"
start cmd /k "node worker.js"

:: Navigate to en-nilam-lotopia and start the frontend server
cd /d D:\React\en-nilam-lotopia
start cmd /k "npm run dev"

echo All services started successfully!
exit
