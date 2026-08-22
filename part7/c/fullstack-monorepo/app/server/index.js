// ⭐ part7 c — Frontend and Backend in the Same Repository —— 课程原文 Code Block 2 verbatim
// 课程原文:"The Express server in server/index.js serves the API and, in production,
// also serves the built frontend from the client/dist directory."
//
// 本子节要点(逐行 ⭐ 中文注释,只解释 WHY,不替换课程代码):
//
// ⭐ 核心概念 1:Express 5.x(支持 /*splat 语法)
//   - 课程 verbatim 用 app.get('/*splat', ...) —— 这是 Express 5 引入的新路径语法
//     (Express 4 用的是 '*',Express 5 因为 path-to-regexp 升级,推荐 /*splat)
//   - 不用 splat:Express 4 警告 "the * path is deprecated; use /*splat"
//   - 用 splat:req.params.splat 拿到路径段数组
//   - 验证:故意把 /*splat 改成 *,Express 4 警告;Express 5 不会警告
//
// ⭐ 核心概念 2:app.use(express.json()) — JSON 请求体解析中间件
//   - 课程原文配套:app.use(express.json())
//   - 不用 express.json():POST /api/notes 时 req.body 是 undefined
//   - 用 express.json():Content-Type: application/json 的 POST 请求体自动解析为 JS 对象
//   - 验证:F12 看到 Network 面板发 POST + payload 是 JSON;console.log(req.body) 在 server 里能拿到对象
//
// ⭐ 核心概念 3:同一进程同时服务 API + 静态前端(生产模式)
//   - 课程原文:"Running npm run build compiles the frontend into the client/dist directory.
//     After that, npm start sets NODE_ENV=production and starts Express, which picks up the
//     static files from client/dist and serves both the API and the frontend from a single port."
//   - 不用 process.env.NODE_ENV switch:dev 时也走静态文件路径 → 看 client/dist 但它可能不存在
//   - 用 switch:dev 不读 client/dist,只响应 API;prod 读 client/dist 同时响应 API 和前端
//   - 关键:同一端口(3001)同时提供 /api/ping 和 /(静态文件),不需要 CORS 因为"同源"
//   - 验证:npm start 后,浏览器 3001 端口直接拿到 React App(无 CORS 问题)
//
// ⭐ 核心概念 4:/*splat catch-all 返回 index.html(前端 SPA 路由兜底)
//   - 课程 verbatim:任何 GET /*splat(非 API / 非静态文件)都返回 client/dist/index.html
//   - 不用 splat:用户访问 /users/123 → Express 404 错误
//   - 用 splat:任何前端路由都拿到 index.html → React Router 接管路由解析
//   - 验证:把客户端路由改成 /users/123,直接访问该 URL,看到页面(而不是 404)

const express = require('express')
const path = require('path')

const app = express()

// ⭐ 解析 application/json 请求体(POST/PUT/PATCH 都需要)
app.use(express.json())

// ⭐ API endpoint:dev 模式下的"心跳"
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', time: new Date().toISOString() })
})

// ⭐ 生产模式:同一 Express 进程同时服务 API 和构建好的前端
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`server running on port ${PORT}`))