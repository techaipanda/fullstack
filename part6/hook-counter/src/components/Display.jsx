// ===== part6a — Using the state from different components(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#using-the-state-from-different-components
// 课程原文 verbatim:part6a.md L284-L298 — 渲染 counter 值的 Display 组件
//
// verbatim 1:1 对照(L286-L298):
//   import { useCounterStore } from './store'
//
//   const Display = () => {
//     const counter = useCounterStore(state => state.counter)
//
//     return (
//       <div>{counter}</div>
//     )
//   }
//
//   export default Display

import { useCounterStore } from '../store'

const Display = () => {
  const counter = useCounterStore(state => state.counter)

  return (
    <div>{counter}</div>
  )
}

export default Display