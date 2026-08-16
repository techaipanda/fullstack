// part5 c — vitest setup 文件
// 章节: "c — Testing React apps / Rendering the component for tests"
//
// 三件事:
// 1) afterEach(cleanup) —— 课程原文要求每个 test 跑完清掉 React Testing Library
//    渲染的 DOM,避免多个 test 之间的 DOM 残留串台(从 @testing-library/react v13
//    起不再自动 cleanup,必须显式调)。
// 2) @testing-library/jest-dom/vitest —— 注册增强 matchers
//    (toBeInTheDocument / toHaveStyle / toHaveTextContent 等)。
// 3) afterEach 从 'vitest' 显式导入 —— 即使 vite.config.js 开了 globals: true,
//    课程原文也是显式 import,这里保持 1:1。
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})