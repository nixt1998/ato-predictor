@echo off
chcp 65001 >nul
title ATO CardiTox - 停止所有服务

echo ╔════════════════════════════════════════════════════════════╗
echo ║         ATO CardiTox - 停止所有服务                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [信息] 正在查找并停止相关进程...
echo.

:: 停止 R API 进程
echo [停止] R API 服务 (Rscript.exe)...
taskkill /F /IM Rscript.exe >nul 2>&1
if errorlevel 1 (
    echo [提示] 未找到运行中的 R API 进程
) else (
    echo [成功] R API 已停止
)
echo.

:: 停止 Node.js 进程（Next.js 开发服务器）
echo [停止] Next.js 前端服务器 (node.exe)...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo [提示] 未找到运行中的 Node.js 进程
) else (
    echo [成功] Next.js 服务器已停止
)
echo.

:: 释放端口（可选）
echo [清理] 检查端口占用...
netstat -ano | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo [警告] 端口 8000 仍被占用，可能需要手动检查
)
netstat -ano | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo [警告] 端口 3000 仍被占用，可能需要手动检查
)
echo.

echo ════════════════════════════════════════════════════════════
echo  所有服务已停止
echo ════════════════════════════════════════════════════════════
echo.

pause
