@echo off
REM MiniCinema 后端启动脚本

echo ============================================
echo MiniCinema 电影票务系统 - 后端启动脚本
echo ============================================
echo.

REM 检查是否安装了 Maven
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Maven，请确保 Maven 已安装并配置在 PATH 中
    echo 请访问：https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo [✓] Maven 已安装
echo.

REM 确保在项目根目录
cd /d "%~dp0"

echo [信息] 开始启动后端服务...
echo.

REM 启动 Spring Boot 应用
mvn clean spring-boot:run

REM 如果上一条命令失败，显示错误
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 启动失败！请检查错误信息
    pause
    exit /b 1
)

pause

