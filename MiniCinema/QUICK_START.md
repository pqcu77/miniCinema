# MiniCinema ngrok 问题 - 快速参考

## 🎯 一句话总结

ngrok 只代理后端 API (8080)，前端静态文件仍需在本地 (3000) 提供，通过诊断工具动态配置 API URL。

## ⚡ 5 分钟快速开始

### 1. 打开 2 个 PowerShell 窗口

### 2. 窗口 1 - 启动后端
```powershell
cd D:\Desktop\Junior\DB_proj\MiniCinema
java -jar target\MiniCinema-0.0.1-SNAPSHOT.jar
```
✅ 后端运行在: `http://localhost:8080`

### 3. 窗口 2 - 启动前端
```powershell
cd D:\Desktop\Junior\DB_proj\MiniCinema\frontend
python -m http.server 3000
```
✅ 前端运行在: `http://localhost:3000`

### 4. 本地测试
浏览器访问：`http://localhost:3000/index.html`

✅ 完成！登录页应该正常显示

## 🌐 使用 ngrok 的额外步骤

### 5. 窗口 3 - 启动 ngrok
```powershell
ngrok http 8080 --host-header=rewrite
```

你会看到：
```
Forwarding    https://abc123.ngrok.io -> http://localhost:8080
```

### 6. 配置 API URL
1. 访问：`http://localhost:3000/diagnostic-v2.html`
2. 点击 **"🌐 ngrok 代理"**
3. 输入：`https://abc123.ngrok.io` (从上面复制)
4. 点击 **"保存 URL"**

### 7. 测试
点击诊断工具中的 **"测试后端连接"** ✅

## 📋 验证清单

```
后端 (localhost:8080)
├─ [ ] Java 运行中
├─ [ ] curl http://localhost:8080/user/login -d '{}' 返回响应
└─ [ ] 后端日志无错误

前端 (localhost:3000)  
├─ [ ] Python HTTP Server 运行中
├─ [ ] 访问 http://localhost:3000/index.html 能看到页面
└─ [ ] 控制台无 403 错误

ngrok (仅当需要公网访问)
├─ [ ] ngrok 进程运行中
├─ [ ] ngrok URL 有效
├─ [ ] 诊断工具配置了正确的 URL
└─ [ ] "测试后端连接" 成功
```

## 🛠️ 使用启动脚本（推荐）

```powershell
.\start.ps1
```

选择 **5** 自动启动所有服务

## 📁 关键文件

| 文件 | 说明 |
|-----|------|
| `start.ps1` | PowerShell 启动脚本（推荐） |
| `start.bat` | Batch 启动脚本 |
| `frontend/diagnostic-v2.html` | 诊断和配置工具 |
| `frontend/js/api.js` | **已修改**：支持动态 URL |
| `SOLUTION_SUMMARY.md` | 完整解决方案文档 |
| `NGROK_GUIDE.md` | ngrok 详细使用指南 |

## 🚨 常见错误

| 错误 | 解决方案 |
|-----|--------|
| 403 Forbidden /js/utils.js | 确保前端在 localhost:3000 运行 |
| Failed to fetch | 检查后端 URL 配置（使用诊断工具） |
| Connection refused | 确保后端在 8080、前端在 3000 运行 |
| ngrok command not found | 安装 ngrok：https://ngrok.com/download |

## 🔧 调试技巧

**浏览器控制台检查 API URL**：
```javascript
// F12 打开控制台，输入：
console.log(API_BASE_URL)
```

**查看当前配置**：
```javascript
// 或访问诊断工具查看统计信息
localStorage.getItem('backendUrl')
```

**重置到默认配置**：
```javascript
localStorage.removeItem('backendUrl')
location.reload()
```

## 📞 需要帮助？

1. ✅ 打开诊断工具：`http://localhost:3000/diagnostic-v2.html`
2. ✅ 运行所有测试
3. ✅ 查看实时日志
4. ✅ 检查 localStorage
5. ✅ 阅读 SOLUTION_SUMMARY.md 或 NGROK_GUIDE.md

---

**💡 核心要点**: ngrok 代理 API，不代理前端页面。前端在本地提供，通过 localStorage 配置动态 API URL。

