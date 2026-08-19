// ============================================================================
// part7 a.3 React.memo — SearchResults 组件
// 作用:演示 React.memo 包裹组件后,props 引用没变时跳过 re-render
// 关联:对应 README.md a.3 段 1-2,以及课程 verbatim 代码块(简化版)
// ============================================================================

import { memo } from 'react'

// ⭐ 核心概念:React.memo
// React.memo 不是 hook,是 Higher-Order Component(HOC)。
// 它"包裹"一个组件,让该组件在 props 没变时跳过 re-render。
//
// 对比 useMemo:useMemo 缓存的是"组件内某段计算的结果"
//              React.memo 缓存的是"整个组件的渲染输出"
//
// 不用 React.memo:
//   父组件 App 渲染 → SearchResults 也会强制 render(即使 props 引用没变)
// 用 React.memo:
//   父组件 App 渲染 → React 对 props 做 shallow equality
//   - props 引用都没变 → 跳过 render(看到 console.log 不会重复打印)
//   - props 引用变了 → 正常 render
//
// 重要前提:React.memo 只对 props 做浅比较。
// 如果 props 里有对象/函数,引用每次都变 → memo 失效(这就是 a.4 useCallback 要解决的)
// ============================================================================
const SearchResultsBase = ({ options }) => {
  // 这个 console.log 是有意为之 — 用来观察组件什么时候 re-render
  // - 父组件 App 渲染 → React 会进入这个组件的 render 阶段
  // - 如果 props 引用变了 → 真的会重渲染(看到日志)
  // - 如果 props 引用没变 + React.memo → 跳过 render(看不到日志)
  console.log('SearchResults rendered')

  return (
    <div>
      <p>caseSensitive: {String(options.caseSensitive)}</p>
      <p>filter: {options.filter || '(empty)'}</p>
    </div>
  )
}

// memo(Component) 返回一个"包装过的组件"。
// 当 options 引用保持不变(配合 a.2 useMemo),React 会跳过 SearchResultsBase 的 render。
const SearchResults = memo(SearchResultsBase)

export default SearchResults
