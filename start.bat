@echo off
title ALIANSI STORE - Next-Gen PlayStation Marketplace
echo ========================================================
echo   🎮 Memulai ALIANSI STORE Next-Gen Marketplace...
echo   Membuka http://localhost:5050 di browser Anda
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
