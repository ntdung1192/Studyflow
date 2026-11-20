@echo off
cd /d "%~dp0client"
if not exist "node_modules" (
  echo Dependencies not found. Installing them...
  call npm.cmd install
  if errorlevel 1 pause & exit /b 1
)
call npm.cmd run dev -- --open
pause
