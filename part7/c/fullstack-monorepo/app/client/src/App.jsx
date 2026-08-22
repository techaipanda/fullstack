// ⭐ part7 c — Frontend and Backend in the Same Repository —— 课程原文没给出 verbatim App.jsx
//
// 课程原文 Code Block 1(Repository Layout)只列出结构 "client/src/App.jsx",没给 App.jsx 内容。
// 本子项目 ⭐ 破例:写一个最小可跑的 App.jsx 来演示 API 调用(proxy + 同源生产服务)。
//
// ⭐ 核心概念:为什么用 '/api/ping' 而不是 'http://localhost:3001/api/ping'
//   - 课程原文:"a frontend fetch to /api/ping is automatically forwarded to the Express server
//     during development, so you never have to hard-code the backend URL."
//   - 不用相对路径 → dev:撞 CORS;prod:跨域也撞(虽然同进程但端口配置差异)
//   - 用相对路径 '/api/ping' → dev:Vite proxy 转发;prod:同一 Express 进程响应 → 无 CORS
//   - 验证:dev 时 Network 面板看到 Remote Address 是 3001;prod 时(npm start 后 npm run build)
//     直接访问 3001 → Remote Address 是 3001,但 fetch 是 same-origin 所以无 proxy

import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [ping, setPing] = useState(null)

  useEffect(() => {
    axios.get('/api/ping').then(response => {
      setPing(response.data)
    })
  }, [])

  return (
    <div>
      <h1>Frontend + Backend in same repository</h1>
      {ping
        ? <p>Server says: <strong>{ping.message}</strong> at {ping.time}</p>
        : <p>loading...</p>}
    </div>
  )
}

export default App