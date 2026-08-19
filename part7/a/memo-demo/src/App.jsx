// ============================================================================
// part7 a.3 React.memo — 父组件 App
// 演示 useMemo + React.memo 配对:稳定 props 引用 + 组件级 memoization
// 关联:README.md a.3 段 1-4,以及课程 verbatim
// ============================================================================

import { useState, useMemo } from 'react'
import FilteredList from './FilteredList.jsx'
import SearchResults from './SearchResults.jsx' // 已被 React.memo 包裹(见 SearchResults.jsx)
import MyComponent from './MyComponent.jsx'     // 课程 verbatim 演示组件

const App = () => {
  // App 顶层 input 的过滤词,会同时控制 SearchResults 和 FilteredList
  const [filter, setFilter] = useState('')
  // 这里有个独立 state 用来"故意让父组件重渲染"
  // 验证:切换它时,React.memo 包裹的子组件应该**跳过** render
  const [other, setOther] = useState(0)

  // ==========================================================================
  // ⭐ 核心概念:为什么对象 props 必须配合 useMemo,React.memo 才能生效?
  // ==========================================================================
  // React.memo 对 props 做 shallow equality(Object.is):
  //   - primitive(字符串/数字/布尔)→ 比值
  //   - 对象/数组/函数 → 比**引用**(同一对象才算相等)
  //
  // 我们的 options 是对象,记住这个事实:
  //   ❌ 没有 useMemo 时:
  //     const options = { caseSensitive: false, filter }
  //     父组件 App 每次 render 都会执行这行代码,
  //     JS 创建一个**新的对象**({...})— 即使 filter 没变,引用也跟上次不同。
  //     React.memo 跑 Object.is(prevOptions, newOptions) → false → memo 失效
  //     → SearchResults 仍然 re-render(即使 props "看起来"一样)
  //
  //   ✅ 用 useMemo 包裹:
  //     const options = useMemo(() => ({ ... }), [filter])
  //     - filter 变了 → 重新生成 options → 引用不同 → SearchResults re-render
  //     - filter 没变 → 返回**上次那个对象的引用** → Object.is 相等 → memo 命中 → 跳过 render
  //
  // 对比 MyComponent(value 是字符串):
  //   value 是 primitive,React.memo 比的是 'hello' === 'hello' → true
  //   即使没用 useMemo,只要值没变,就跳过 render
  //
  // 所以:
  //   - 对象/数组/函数 props → 必须配合 useMemo / useCallback 才能让 React.memo 生效
  //   - primitive props → React.memo 自动就能工作
  // ==========================================================================
  const options = useMemo(() => ({ caseSensitive: false, filter }), [filter])

  // 演示 a.3 verbatim 的 MyComponent: 接收一个字符串 value
  // 字符串是 primitive,值比较
  const myValue = useMemo(() => `hello ${filter}`, [filter])

  return (
    <div>
      <h1>part7 a.3 — React.memo demo</h1>
      <div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="filter items"
        />
      </div>
      <div>
        {/* 故意让父组件重渲染,但跟 SearchResults/MyComponent 的 props 都无关 */}
        <button onClick={() => setOther(other + 1)}>
          bump unrelated state ({other})
        </button>
      </div>
      <SearchResults options={options} />
      <MyComponent value={myValue} />
      <FilteredList />
    </div>
  )
}

export default App
