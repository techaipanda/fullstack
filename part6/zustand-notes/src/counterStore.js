// ===== part6b — ### Testing Zustand stores(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#testing-zustand-stores
// 课程原文 verbatim:part6b.md L832-L1034 — 教学 counter store,作为下一节
// Testing the notes store 的铺垫。
//
// 课程叙事弧(L832-L1034):
//   课程作者用了一个独立的 counter store 来演示测试,而不是直接拿复杂的
//   notes store 演示。课程 L856:"We added an export to the definition for
//   the tests, through which the test can access the store."
//   课程 L1033:整套代码 GitHub 在 fullstack-hy2020/zustand-counter 独立 repo。
//
// verbatim 1:1 对照(L838-L854):
//   import { create } from 'zustand'
//
//   const useCounterStore = create(set => ({
//     counter: 0,
//     actions: {
//       increment: () => set(state => ({ counter: state.counter + 1 })),
//       decrement: () => set(state => ({ counter: state.counter - 1 })),
//       zero: () => set(() => ({ counter: 0 })),
//     }
//   }))
//
//   export const useCounter = () => useCounterStore(state => state.counter)
//   export const useCounterControls = () => useCounterStore(state => state.actions)
//
//   export default useCounterStore // highlight-line
//
// ⚠️ 文件命名调整:课程原文测试都 `import from './store'`,但我们项目里
//    ./store 已被 notes store 占用。counter 教学文件命名 counterStore.js,
//    test 文件 import 路径相应改为 './counterStore'。代码字面 1:1 verbatim,
//    仅为本项目 multi-store layout 的必要路径调整。

import { create } from 'zustand'

const useCounterStore = create(set => ({
  counter: 0,
  actions: {
    increment: () => set(state => ({ counter: state.counter + 1 })),
    decrement: () => set(state => ({ counter: state.counter - 1 })),
    zero: () => set(() => ({ counter: 0 })),
  }
}))

export const useCounter = () => useCounterStore(state => state.counter)
export const useCounterControls = () => useCounterStore(state => state.actions)

export default useCounterStore // highlight-line