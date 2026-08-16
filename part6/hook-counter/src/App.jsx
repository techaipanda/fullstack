// ===== part6a — Zustand(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#zustand
// 课程原文 verbatim:part6a.md L34-L248(### Zustand 一整节)的最终完整代码块
// (L215-L241),把 hook-counter 仓库原 useReducer 实现改造为 Zustand store。
//
// 课程 step-by-step 流程(本仓库按最终态一次性落,过程中各 stage 代码块原样
// 保留在 part6a.md 作为阅读材料,不再单独 commit 每个 stage):
//
//   stage 1 (L49-L73):只实现 increment + plus 按钮工作
//   stage 2 (L77-L83):单独讲解 create(set => ({...})) 工厂函数
//   stage 3 (L99-L119):讲 selector 函数 useCounterStore(state => state.xxx)
//   stage 4 (L123-L156):拆解 set(state => ({ counter: state.counter + 1 }))
//                    → state 是旧 state,返回新 partial state,Zustand 自动 merge
//   stage 5 (L215-L241,FINAL):3 个按钮完整版 — 本仓库直接落这个最终态
//   FAQ  (L243-L247):set 和 state 哪里来 — Zustand create 自动注入,不需自己 import
//
// verbatim 1:1 对照(L215-L241):
//   const useCounterStore = create(set => ({
//     counter: 0,
//     increment: () => set(state => ({ counter: state.counter + 1 })),
//     decrement: () => set(state => ({ counter: state.counter - 1 })),
//     zero: () => set(() => ({ counter: 0 })),
//   }))
//
//   const App = () => {
//     const counter = useCounterStore(state => state.counter)
//     const increment = useCounterStore(state => state.increment)
//     const decrement = useCounterStore(state => state.decrement)
//     const zero = useCounterStore(state => state.zero)
//     ...
//   }
//
// 本节**未**做的事(留给后续小节 verbatim 推进):
//   - store 抽到独立 src/useCounterStore.js(后续 ### Using state from different components
//     或后续小节会做)
//   - 拆分 store(notes 章节的 Reorganizing the state 会做)
//   - 中间件 / 测试(Middlewares / Testing Zustand stores 后续小节)

import { create } from 'zustand'

const useCounterStore = create(set => ({
  counter: 0,
  increment: () => set(state => ({ counter: state.counter + 1 })),
  decrement: () => set(state => ({ counter: state.counter - 1 })),
  zero: () => set(() => ({ counter: 0 })),
}))

const App = () => {
  const counter = useCounterStore(state => state.counter)
  const increment = useCounterStore(state => state.increment)
  const decrement = useCounterStore(state => state.decrement)
  const zero = useCounterStore(state => state.zero)

  return (
    <div>
      <div>{counter}</div>
      <div>
        <button onClick={increment}>plus</button>
        <button onClick={decrement}>minus</button>
        <button onClick={zero}>zero</button>
      </div>

    </div>
  )
}

export default App