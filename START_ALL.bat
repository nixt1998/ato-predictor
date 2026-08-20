@echo off
chcp 65001 >nul
title ATO CardiTox - 一键启动所有服务

echo ╔════════════════════════════════════════════════════════════╗
echo ║         ATO CardiTox 预测系统 - 一键启动                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [信息] 当前目录: %CD%
echo.

:: 检查 R 是否安装
echo [检查] 正在验证 R 环境...
set RSCRIPT_PATH=C:\Program Files\R\R-4.5.0\bin\x64\Rscript.exe
if not exist "%RSCRIPT_PATH%" (
    echo [错误] 未找到 R 4.5.0，请确认安装路径
    echo        期望路径: %RSCRIPT_PATH%
    pause
    exit /b 1
)
echo [成功] R 环境已找到
echo.

:: 检查 Node.js 是否安装
echo [检查] 正在验证 Node.js 环境...
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装
    pause
    exit /b 1
)
echo [成功] Node.js 环境已找到
echo.

:: 检查模型文件
echo [检查] 正在验证 R API 模型文件...
if not exist "r-api\optim_wflow_last_fit.rds" (
    echo [错误] 缺少模型文件: optim_wflow_last_fit.rds
    pause
    exit /b 1
)
echo [成功] 模型文件完整
echo.

echo ════════════════════════════════════════════════════════════
echo  正在启动服务...
echo ════════════════════════════════════════════════════════════
echo.

:: 启动 R API（后台）
echo [启动] R API 服务 (端口 8000)...
start "ATO R-API" /min cmd /c "cd /d "%~dp0r-api" && "%RSCRIPT_PATH%" start.R"
timeout /t 3 /nobreak >nul
echo [成功] R API 已在后台启动
echo.

:: 启动前端（前台）
echo [启动] Next.js 前端服务器 (端口 3000)...
echo.
set APPDATA=F:\AppData\Roaming
npm run dev

pause
