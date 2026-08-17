// ===== part6b — ### Testing Zustand stores(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#testing-zustand-stores
// 课程原文 verbatim:part6b.md L928-L942 — 加 vitest 配置,test environment = jsdom。
//
// verbatim 1:1 对照(L928-L942):
//   import { defineConfig } from 'vite'
//   import react from '@vitejs/plugin-react'
//
//   export default defineConfig({
//     plugins: [react()],
//     // highlight-start
//     test: {
//       environment: 'jsdom',
//     },
//      // highlight-end
//   })
//
// 课程 L922-L926:"useCounter and useCounterControls are React hooks, so testing
// them requires React Testing Library and the jsdom library"
// "npm install --save-dev @testing-library/react jsdom" — 这一节装 jsdom,
// 然后 vite.config.js 配 environment:'jsdom',vitest 跑 hook 测试时给到 jsdom 环境。

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // highlight-start
  test: {
    environment: 'jsdom',
  },
   // highlight-end
})
