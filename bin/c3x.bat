@echo off
echo.
echo =======================================================
echo                 C?X CLI - Windows Launcher
echo =======================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Run the CLI
node "%~dp0\c3x.js" %*

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] CLI exited with error code %errorlevel%
    pause
)
