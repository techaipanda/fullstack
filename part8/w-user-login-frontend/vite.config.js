// ⭐⭐⭐ vite.config.js — Vite + React plugin 配置(verbatim part8k Vite scaffold)⭐⭐⭐
//
// ⭐ 关键诚实声明:本文件**完全 verbatim 沿用 part8k** 的 vite.config.js
//   - 课程原文:"Let's create a new React app"(imply Vite — Create React App 已弃用)
//   - 此文件按 Vite 官方 React 模板 verbatim 写 — 与课程 Chapter 5 业务逻辑**无关**
//   - 是 Vite 工程必需的工程配置文件,不属于任何一节的"业务代码"
//
// ⭐ 关键设计:
//   - defineConfig: Vite 配置工厂函数,提供 IDE 类型提示
//   - plugins: [react()] — 启用 React Fast Refresh + JSX 转译
//   - 本节**故意不**配 server.proxy — Apollo Client 直接连 localhost:4000
//     (后端 part8u/v 已开启 CORS,per part8o "Updating the cache" 已验证)
//
// ⭐ 跟 part8k 唯一差异:文件顶部注释里点名 part8w 而非 part8k
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})