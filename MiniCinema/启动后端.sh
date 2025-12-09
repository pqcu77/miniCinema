#!/bin/bash
# MiniCinema Linux/Mac 后端启动脚本

echo "============================================"
echo "MiniCinema 电影票务系统 - 后端启动脚本"
echo "============================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 进入项目目录
cd "$SCRIPT_DIR"

echo "[信息] 开始启动后端服务..."
echo ""

# 启动 Spring Boot 应用
mvn clean spring-boot:run

# 如果上一条命令失败，显示错误
if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 启动失败！请检查错误信息"
    exit 1
fi

