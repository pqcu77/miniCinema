#!/bin/bash
# MiniCinema Linux/Mac 前端启动脚本

echo "============================================"
echo "MiniCinema 电影票务系统 - 前端启动脚本"
echo "============================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 进入项目目录
cd "$SCRIPT_DIR"

# 进入前端文件夹
cd frontend

echo "[信息] 启动前端服务..."
echo ""
echo "请选择启动方式："
echo "1. Live Server (推荐，需先安装 npm)"
echo "2. Python Http Server (Python 3)"
echo ""

read -p "请输入选择 (1-2): " choice

case $choice in
    1)
        # 检查 live-server 是否安装
        if ! command -v live-server &> /dev/null; then
            echo ""
            echo "[信息] Live Server 未安装，正在尝试全局安装..."
            npm install -g live-server
            if [ $? -ne 0 ]; then
                echo "[错误] npm 未找到，请确保已安装 Node.js"
                echo "访问：https://nodejs.org/"
                exit 1
            fi
        fi
        echo ""
        echo "[✓] 启动 Live Server..."
        echo "前端地址：http://localhost:5500"
        echo ""
        live-server
        ;;
    2)
        echo "[✓] 启动 Python 3 Http Server..."
        echo "前端地址：http://localhost:8000"
        echo ""
        python3 -m http.server 8000
        ;;
    *)
        echo "[错误] 无效的选择！"
        exit 1
        ;;
esac

exit 0

