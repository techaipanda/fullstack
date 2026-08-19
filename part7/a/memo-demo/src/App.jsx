// ============================================================================
// part7 a.2 useMemo — 父组件 App
// 演示 useMemo 的第二个高频用途:稳定对象/数组 props 的引用,避免
// 子组件无意义的 re-render。
// 关联:对应 README.md 段 7,以及课程 verbatim 代码块 3
// ============================================================================

import { useState, useMemo } from 'react'
import FilteredList from './FilteredList.jsx'   // 复用品 a.2 demo 里的列表组件
import SearchResults from './SearchResults.jsx' // 占位子组件,a.3 段会用 React.memo 包裹

const App = () => {
  // App 顶层 input 的过滤词,会同时控制 SearchResults 和 FilteredList
  const [filter, setFilter] = useState('')

  // ==========================================================================
  // ⭐ 核心概念:useMemo memoize 对象/数组
  // ==========================================================================
  // 假设 SearchResults 是一个昂贵组件(比如长表格、图表、虚拟滚动列表)。
  // 每次 App 重渲染(用户切 dark mode?父组件任何 state 变?)都要重算 options 对象。
  //
  // ❌ 没有 useMemo 的版本:
  //   const options = { caseSensitive: false, filter }
  // 每次渲染,JS 都创建一个**新的对象**,即使 filter 没变,引用也不同。
  // 子组件 React 默认用 Object.is 比较 props:
  //   Object.is(prevOptions, newOptions) === false  // 因为是不同对象
  // → SearchResults 会被判定 props 变了 → re-render
  //
  // ✅ 用 useMemo 包裹:
  //   const options = useMemo(() => ({ ... }), [filter])
  // - filter 变了 → 重新生成 options → 子组件 re-render
  // - filter 没变 → 返回上次的引用 → Object.is 判定相等 → 子组件可跳过 re-render
  //
  // 这种"用 useMemo 稳定 props 引用"的用法,
  // 跟 a.3 段会讲的 React.memo 是天作之合(单独用 React.memo 没用,因为 props 引用
  // 每次都变,memo 的浅比较一直 fail,等于没用)。
  // ==========================================================================
  const options = useMemo(() => ({ caseSensitive: false, filter }), [filter])

  return (
    <div>
      <h1>part7 a.2 — useMemo demo</h1>
      <div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="filter items"
        />
      </div>
      <SearchResults options={options} />
      <FilteredList />
    </div>
  )
}

export default App
