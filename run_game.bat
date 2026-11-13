@echo off
title SET! 4-of-a-Kind Card Game
cd /d "%~dp0"
echo ======================================================
echo   Starting SET! Card Passing Arena Server...
echo ======================================================
set PORT=3005
start "" http://localhost:3005
node server.js
pause
