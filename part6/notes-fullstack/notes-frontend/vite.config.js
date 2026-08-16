// part5 c — vite.config.js
// 章节: "c — Testing React apps / Rendering the component for tests"
//
// 相对 part5 b 的关键改动:
// 1. 新增 test 配置块,启用 vitest
// 2. environment: 'jsdom' —— 让 React 组件能在 jsdom 渲染(浏览器 DOM)
// 3. globals: true —— test/expect/describe 不需显式 import
// 4. setupFiles —— 启动 vitest 前先加载 jest-dom matchers
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },

  // part5 c — vitest 配置
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
