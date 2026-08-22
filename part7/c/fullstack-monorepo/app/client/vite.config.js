// ⭐ part7 c — Frontend and Backend in the Same Repository —— 课程原文 Code Block 3 verbatim
// 课程原文:"With the proxy in place, a frontend fetch to /api/ping is automatically forwarded
// to the Express server during development, so you never have to hard-code the backend URL."
//
// 本子节要点(逐行 ⭐ 中文注释,只替换/补充必要的部分):
//
// ⭐ 核心概念:dev proxy —— b 章讲过但这里是 monorepo 场景的实战
//   - 课程原文配套(已在 b 章 vite-config-demo 子项目演示过):前端 axios.get('/api/ping')
//     → 浏览器以为是同源(localhost:5173)→ Vite dev server 转发到 localhost:3001/api/ping
//   - b 章用的是对象语法(target+changeOrigin);这里课程用简写字符串
//     (功能等价,Vite 默认 changeOrigin=true)
//   - 验证:看 Network 面板的 /api/ping 请求,Status 200,Response 是 {message, time}
//
// 关键差异 vs b 章 vite-config-demo:
//   - b 章是独立子项目,proxy 是单独配置演示
//   - 这里 proxy 是 monorepo 必备 —— 不配就撞 CORS,因为 dev 时前端 5173 + 后端 3001 是跨端口

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})