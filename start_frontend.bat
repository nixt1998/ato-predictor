@echo off
chcp 65001 >nul
title ATO CardiTox - Frontend Server

echo ========================================
echo   ATO CardiTox Frontend Server
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] 当前目录: %CD%
echo [INFO] 正在启动 Next.js 开发服务器...
echo.

set APPDATA=F:\AppData\Roaming
npm run dev

pause
