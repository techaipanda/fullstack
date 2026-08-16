// ===== part6a — Using the state from different components(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#using-the-state-from-different-components
// 课程原文 verbatim:part6a.md L251-L262 — 把 useCounterStore 从 App.jsx 抽到独立 store.js
// 课程 store.js 文本只给 create 调用(L255-L262),本文件按 React/Vite 项目
// 惯例补一行 `import { create } from 'zustand'`(课程 main.jsx 处隐含)
//
// verbatim 1:1 对照(L255-L262):
//   export const useCounterStore = create(set => ({
//     counter: 0,
//     increment: () => set(state => ({ counter: state.counter + 1 })),
//     decrement: () => set(state => ({ counter: state.counter - 1 })),
//     zero: () => set(() => ({ counter: 0 })),
//   }))

import { create } from 'zustand'

export const useCounterStore = create(set => ({
  counter: 0,
  increment: () => set(state => ({ counter: state.counter + 1 })),
  decrement: () => set(state => ({ counter: state.counter - 1 })),
  zero: () => set(() => ({ counter: 0 })),
}))