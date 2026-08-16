// ===== part6a — Reorganizing the state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#reorganizing-the-state
// 课程原文 verbatim:part6a.md L373-L424 — 解决上节 L361 的"过度渲染"问题 +
// 引入 best practice:对外暴露小视图 hook(useCounter / useCounterControls),
// 不直接导出完整 store。
//
// 课程两步演化:
//   step 1 (L377-L386):把 3 个 action 合并到 `actions` 子对象
//      → 上节 Controls 用 3 个独立 selector(L365-L369)虽然不错,
//        但更多 action 时(>3)会有"selector 地狱"。actions 子对象
//        让所有 action 引用永远稳定(L405:"they remain the same for
//        the entire lifetime of the store"),destructure 它不会触发
//        组件重渲染(因为 actions 对象引用从不变化)。
//
//   step 2 (L409-L424,FINAL):按 tkdodo best practice,不导出完整 store,
//        改成导出 2 个小视图 hook:
//          useCounter() → 取 counter 值
//          useCounterControls() → 取 actions 对象
//        这样所有用 selector 的细节都封在 store.js 内部,
//        外部组件只用这 2 个 hook,完全不需要写 selector。
//
// verbatim 1:1 对照(L409-L424):
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
//   // the hook functions that are used elsewhere in app
//   export const useCounter = () => useCounterStore(state => state.counter)
//   export const useCounterControls = () => useCounterStore(state => state.actions)
//
// 课程 L458 自定义 hook 规则提醒:`useCounter`/`useCounterControls` 本质都是
// React custom hook(因为内部调用了 useCounterStore),所以名称必须以 `use`
// 开头,且 Part 1 讲过的 rules of hooks 同样适用。

import { create } from 'zustand'

const useCounterStore = create(set => ({
  counter: 0,
  actions: {
    increment: () => set(state => ({ counter: state.counter + 1 })),
    decrement: () => set(state => ({ counter: state.counter - 1 })),
    zero: () => set(() => ({ counter: 0 })),
  }
}))

// the hook functions that are used elsewhere in app
export const useCounter = () => useCounterStore(state => state.counter)
export const useCounterControls = () => useCounterStore(state => state.actions)