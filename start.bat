@echo off
title Neptune Downloader Launcher
echo ==================================================
echo         Neptune Media Downloader Launcher
echo ==================================================
echo.

:: Check Node.js installation
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js first.
    echo Press any key to exit...
    pause >nul
    exit /b
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b
    )
    echo [INFO] Dependencies installed successfully.
    echo.
)

:: Wait 3 seconds and launch browser in the background
echo [INFO] Launching browser in 3 seconds...
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start the concurrent development server
echo [INFO] Starting Neptune Server...
echo [INFO] Server API is on port 5000
echo [INFO] Frontend web UI is on port 5173
echo.
call npm run dev

pause
