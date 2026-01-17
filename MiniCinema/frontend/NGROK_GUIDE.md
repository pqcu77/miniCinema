# MiniCinema - ngrok 公网访问指南

## 问题分析

你遇到的问题主要是：
1. **JS 文件返回 403** - Python HTTP 服务器可能有权限或路径问题
2. **前后端 URL 不匹配** - 前端使用 localhost:8080，但通过 ngrok 访问

## 解决方案

### 1. 重启前端服务

**方式 A：使用 PowerShell（推荐）**
```powershell
# 打开 PowerShell 进入前端目录
cd D:\Desktop\Junior\DB_proj\MiniCinema\frontend

# 启动 HTTP 服务器（Python 3）
python -m http.server 3000

# 或使用 py 命令
py -m http.server 3000
```

**方式 B：使用 bat 脚本**
```bash
# 双击运行前端目录中的 start-server.bat
```

### 2. 验证前端访问

本地访问：
```
http://localhost:3000
```

应该能看到：
- 📄 login.html
- 📄 movies.html
- 📄 js/
- 📄 css/
- 等其他文件

### 3. ngrok 配置（后端转发）

后端已经在 8080 运行，ngrok 应该这样配置：

```bash
# 转发后端
ngrok http 8080
```

这会给你一个 ngrok URL，如：
```
https://phytological-kamryn-precatory.ngrok-free.dev
```

### 4. 前端通过 ngrok 访问

**重要**：前端不需要通过 ngrok，而是直接访问前端服务器

- ✅ 前端：http://localhost:3000 (本地)
- ✅ 后端通过 ngrok：https://phytological-kamryn-precatory.ngrok-free.dev (公网)

或者，如果你想让前端也通过 ngrok 公网访问，需要额外的 ngrok 转发：

```bash
# Terminal 1：转发前端
ngrok http 3000

# Terminal 2：转发后端
ngrok http 8080
```

### 5. API URL 自动配置

前端已经更新，会自动检测：

- **本地访问** (http://localhost:3000 或 http://127.0.0.1:3000)
  - API URL 自动设置为 `http://localhost:8080`

- **ngrok 访问** (https://xxx-xxx-xxx.ngrok-free.dev)
  - API URL 自动设置为 `https://xxx-xxx-xxx.ngrok-free.dev`（使用同一个 ngrok 域名）

### 6. 排查步骤

**第一步：检查前端服务是否正常**
```
打开浏览器访问 http://localhost:3000
应该看到 login.html 或 index.html 页面
```

**第二步：检查浏览器控制台**
```
按 F12 打开开发者工具
查看 Console 标签
应该看到消息：✅ API URL 初始化: http://localhost:8080
```

**第三步：检查后端是否运行**
```
访问 http://localhost:8080/movie/list?page=1&pageSize=12
如果看到 JSON 响应，后端正常
```

**第四步：测试登录**
```
在登录页输入用户名和密码
检查浏览器控制台和网络请求
应该看到 POST 请求发送到正确的 API URL
```

## 常见问题

### Q: JS 文件返回 403
**A:** 
- 检查 Python HTTP 服务器是否在正确目录运行
- 确保权限正确
- 重新启动服务器

### Q: 访问 ngrok URL 后无法加载资源
**A:**
- 检查 ngrok 是否只转发了后端（8080）
- 前端应该直接访问 localhost:3000，不要通过 ngrok 访问前端
- 或者使用两个 ngrok 隧道，一个转发前端，一个转发后端

### Q: 登录失败
**A:**
- 打开浏览器 F12 查看 Network 标签
- 确认 API 请求发送到了正确的 URL
- 查看后端日志是否收到请求

## 总结

```
┌─────────────────────────────────────────────────────────┐
│                    MiniCinema 架构                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  用户浏览器                                             │
│    ↓                                                    │
│  本地访问: http://localhost:3000                       │
│    ↓                                                    │
│  前端服务器 (Python HTTP Server)                       │
│    ↓                                                    │
│  后端 API: http://localhost:8080                      │
│    ↓                                                    │
│  数据库 (GaussDB)                                      │
│                                                         │
│  ───────────── ngrok 公网转发 ─────────────            │
│                                                         │
│  公网用户 → ngrok 隧道 → 后端 8080                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 下一步

1. ✅ 重启前端服务
2. ✅ 确保后端运行在 8080
3. ✅ 测试本地访问 http://localhost:3000
4. ✅ 验证登录功能是否正常
5. ✅ 配置 ngrok 转发后端
6. ✅ 通过 ngrok URL 测试公网访问

