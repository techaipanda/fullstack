// ⭐ part7 c — Error Boundary 子节配套的最小 Vite 配置
// 与 b 章 / c 章 Class Components 子项目相比,本子项目不演示 proxy / sourcemap 等配置:
// Error boundary 是纯 UI 概念,无网络层、无构建配置定制需求
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})