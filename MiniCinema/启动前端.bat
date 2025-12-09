@echo off
REM MiniCinema 前端启动脚本

echo ============================================
echo MiniCinema 电影票务系统 - 前端启动脚本
echo ============================================
echo.

REM 获取脚本所在目录
cd /d "%~dp0"

REM 进入前端文件夹
cd frontend

echo [信息] 启动前端服务...
echo.
echo 请选择启动方式：
echo 1. Live Server (推荐，需先安装 npm)
echo 2. Python Http Server (Python 3)
echo 3. Python SimpleHTTPServer (Python 2)
echo.

set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" (
    where live-server >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [信息] Live Server 未安装，正在尝试全局安装...
        npm install -g live-server
        if %ERRORLEVEL% NEQ 0 (
            echo [错误] npm 未找到，请确保已安装 Node.js
            echo 访问：https://nodejs.org/
            pause
            exit /b 1
        )
    )
    echo.
    echo [✓] 启动 Live Server...
    echo 前端地址：http://localhost:5500
    echo.
    live-server
) else if "%choice%"=="2" (
    echo [✓] 启动 Python 3 Http Server...
    echo 前端地址：http://localhost:8000
    echo.
    python -m http.server 8000
) else if "%choice%"=="3" (
    echo [✓] 启动 Python 2 SimpleHTTPServer...
    echo 前端地址：http://localhost:8000
    echo.
    python -m SimpleHTTPServer 8000
) else (
    echo [错误] 无效的选择！
    pause
    exit /b 1
)

pause

