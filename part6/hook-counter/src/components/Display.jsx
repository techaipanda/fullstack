// ===== part6a — Reorganizing the state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#reorganizing-the-state
// 课程原文 verbatim:part6a.md L428-L438 — Display 改用新的对外 hook useCounter
//
// verbatim 1:1 对照(L428-L438):
//   import { useCounter } from './store' // highlight-line
//
//   const Display = () => {
//     const counter = useCounter() // highlight-line
//
//     return (
//       <div>{counter}</div>
//     )
//   }
//
// 课程 L456 强调:"there is no longer a need to use selector functions,
// as their use is hidden inside the definition of the new helper functions"
// — selector 的细节完全封在 store.js 内部,Display 只调用 useCounter() 即可。

import { useCounter } from '../store'

const Display = () => {
  const counter = useCounter()

  return (
    <div>{counter}</div>
  )
}

export default Display