@echo off
chcp 65001 >nul
title StudyFlow Pro
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Chua cai Node.js. Tai ban 22 tro len tai https://nodejs.org roi chay lai.
  pause
  exit /b 1
)

call node scripts\setup.mjs
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo Dang chay backend (http://127.0.0.1:4000) va frontend (http://localhost:5173)...
echo Dong cua so nay hoac bam Ctrl+C de dung.
echo.
call npm.cmd run dev:open
pause
