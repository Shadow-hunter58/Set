@echo off
title SET! 4-of-a-Kind Card Game
cd /d "%~dp0"
echo ======================================================
echo   Starting SET! Card Passing Arena Server...
echo ======================================================
start "" http://localhost:3000
node server.js
pause
