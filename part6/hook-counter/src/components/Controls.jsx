// ===== part6a — Reorganizing the state(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#reorganizing-the-state
// 课程原文 verbatim:part6a.md L440-L454 — Controls 改用新的对外 hook useCounterControls
//
// verbatim 1:1 对照(L440-L454):
//   import { useCounterControls } from './store' // highlight-line
//
//   const Controls = () => {
//     const { increment, decrement, zero } = useCounterControls() // highlight-line
//
//     return (
//       <div>
//         <button onClick={increment}>plus</button>
//         <button onClick={decrement}>minus</button>
//         <button onClick={zero}>zero</button>
//       </div>
//     )
//   }
//
// 课程 L405:"they remain the same for the entire lifetime of the store" —
// actions 对象引用永远稳定,所以 const { increment, decrement, zero } = useCounterControls()
// 这里 destructure 不会触发过度渲染(L361 上节警告的 destructuring 陷阱已规避)。

import { useCounterControls } from '../store'

const Controls = () => {
  const { increment, decrement, zero } = useCounterControls()

  return (
    <div>
      <button onClick={increment}>plus</button>
      <button onClick={decrement}>minus</button>
      <button onClick={zero}>zero</button>
    </div>
  )
}

export default Controls