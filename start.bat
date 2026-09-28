@echo off
setlocal enabledelayedexpansion
title BodaPesa
cd /d "%~dp0"

echo.
echo   ===========================================
echo    BodaPesa - financial literacy platform
echo   ===========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [X] Node.js is not installed on this machine.
  echo.
  echo       Download the LTS build from https://nodejs.org
  echo       then close this window and run start.bat again.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=1,2 delims=v." %%a in ("!NODE_VERSION!") do (
  set MAJOR=%%a
  set MINOR=%%b
)

echo   Node.js !NODE_VERSION! detected.

if !MAJOR! LSS 22 goto oldnode
if !MAJOR! EQU 22 if !MINOR! LSS 5 goto oldnode

rem Install when dependencies are missing OR out of date. After an update the
rem node_modules folder can exist but lack new packages, so its mere presence
rem is not enough - npm ls fails whenever anything required is missing.
call npm ls --depth=0 >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Installing dependencies. This takes a minute or two the first time.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [X] npm install failed. Check the messages above.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo   Starting the server. Your browser will open automatically.
echo   Leave this window open while you use the platform.
echo   Press Ctrl+C here when you are finished.
echo.
echo   If the page says the database was created by an earlier version,
echo   close this window, run:  npm run db:reset   and start again.
echo.

start "" cmd /c "timeout /t 10 /nobreak >nul & start "" http://localhost:3000"
call npm run dev

echo.
echo   Server stopped.
pause
exit /b 0

:oldnode
echo.
echo   [X] This project needs Node.js 22.5 or newer.
echo       You have !NODE_VERSION!.
echo.
echo       The platform uses Node's built-in SQLite driver, which
echo       does not exist in older versions. Install the current LTS
echo       from https://nodejs.org and run start.bat again.
echo.
pause
exit /b 1
