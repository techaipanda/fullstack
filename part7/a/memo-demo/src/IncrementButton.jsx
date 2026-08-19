// ============================================================================
// part7 a.4 useCallback — IncrementButton 组件(课程 verbatim 代码块)
// 演示:用 React.memo 包裹 + 接收函数 prop(onIncrement)
// 关联:README.md a.4 段 1-5 + 课程 verbatim 代码块
// ============================================================================

import { memo } from 'react'

// ============================================================================
// ⭐ 核心概念:函数 prop + React.memo 的失效场景,以及 useCallback 的解决思路
// ============================================================================
// 这个组件故意"长得跟 SearchResults/MyComponent 一样"但接收**函数** prop:
//   - SearchResults 接收 options(对象 prop)
//   - MyComponent    接收 value(primitive prop)
//   - IncrementButton 接收 onIncrement(**函数 prop**) ← a.4 的新场景
//
// React.memo 对 props 做 shallow equality:
//   - primitive → 比值
//   - 对象/数组/函数 → 比引用(Object.is)
//
// 关键观察:函数(箭头函数)在 JS 里是对象引用。
//   父组件 App 每次 render,如果不加 useCallback,就相当于:
//     const handleIncrement = () => setCount(c => c + 1)
//   每次执行 `() => ...` 都创建一个**新函数对象** — 引用每次都不同。
//   React.memo 跑 Object.is(prevFn, newFn) → 永远 false → memo 失效
//   → IncrementButton 跟着父组件一起 re-render(即使 count 没变)。
//
// 解法见 src/App.jsx ⭐ 核心概念 段(用 useCallback 稳定函数引用)
// ============================================================================
const IncrementButtonBase = ({ onIncrement }) => {
  // 这个 console.log 是有意为之 — 用来观察什么时候 IncrementButton re-render
  // - 父组件 App 任何 state 变了 → 如果 onIncrement 引用没变 + React.memo → 跳过
  // - 父组件 App 任何 state 变了 → 如果 onIncrement 引用变了 → memo 失效 → 重渲染
  console.log('IncrementButton rendered')

  return (
    <button onClick={onIncrement}>
      +1
    </button>
  )
}

// 用 React.memo 包裹(注意:React.memo 只对 props 做浅比较)
const IncrementButton = memo(IncrementButtonBase)

export default IncrementButton