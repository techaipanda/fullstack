// ===== part6a — Using the state from different components(课程 1:1)=====
// 课程章节: https://fullstackopen.com/en/part6/flux_architecture_and_zustand#using-the-state-from-different-components
// 课程原文 verbatim:part6a.md L302-L322 + L363-L369 — Controls 组件
//
// 课程演化:
//   stage A (L304-L322):3 个独立 selector(已是课程推荐写法)
//   stage B (L343-L359):destructuring 解构写法 — 课程后段(L361)明示这种写法
//     有"重大缺陷",会让 Controls 在 counter 变化时重渲染
//   stage C (L365-L369,FINAL 单独 selector):课程最终推荐写法 — 只 select 用到的
//     部分,组件不会因 counter 变化而重渲染(因为没 select counter)
//
// 本仓库直接落 stage C(课程最终推荐),verbatim 1:1 对照(L365-L369):
//   const increment = useCounterStore((state) => state.increment)
//   const decrement = useCounterStore((state) => state.decrement)
//   const zero = useCounterStore((state) => state.zero)

import { useCounterStore } from '../store'

const Controls = () => {
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  const zero = useCounterStore((state) => state.zero)

  return (
    <div>
      <button onClick={increment}>plus</button>
      <button onClick={decrement}>minus</button>
      <button onClick={zero}>zero</button>
    </div>
  )
}

export default Controls